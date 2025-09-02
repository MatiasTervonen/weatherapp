import { NextResponse, NextRequest } from "next/server";
import { fetchRadarData } from "@/app/lib/radarData";
import * as geotiff from "geotiff";
import { PNG } from "pngjs";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

function storageKey(ts: string): string {
  const safe = new Date(ts).toISOString();

  return `frames/${safe}.png`;
}

function getColor(value: number): [number, number, number, number] {
  if (value < 0.1) return [0, 0, 0, 0];
  if (value < 0.3) return [50, 150, 255, 220];
  if (value < 0.7) return [100, 255, 150, 230];
  if (value < 1.0) return [50, 200, 50, 240];
  if (value < 2.0) return [255, 255, 100, 255];
  if (value < 5.0) return [255, 165, 50, 255];
  if (value < 10.0) return [255, 100, 100, 255];
  return [200, 0, 0, 255];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const radarData = await fetchRadarData();

    if (!radarData || radarData.length === 0) {
      return NextResponse.json(
        { error: "No radar data available" },
        { status: 404 }
      );
    }

    const { data, error: listError } = await supabaseAdmin.storage
      .from("radar_images")
      .list("frames");

    if (listError) {
      console.error("Error listing images:", listError);
    } else if (data && data.length > 0) {
      const allPaths = data.map((f) => f.name);
      const { error: deleteError } = await supabaseAdmin.storage
        .from("radar_images")
        .remove(allPaths);

      if (deleteError) {
        console.error("Error deleting old images:", deleteError);
      } else {
        console.log("Successfully deleted old images");
      }
    }

    await supabaseAdmin.from("radar_frames").delete();

    const rowsToInsert: Array<{
      ts: string;
      path: string;
      coords: number[];
    }> = [];

    for (const frame of radarData) {
      const res = await fetch(frame.url, { cache: "no-store" });

      if (!res.ok) {
        console.warn("failed to fetch", frame.url);
        continue;
      }

      const arrayBuffer = await res.arrayBuffer();

      const tiff = await geotiff.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      const width = image.getWidth();
      const height = image.getHeight();
      const raster = await image.readRasters();
      const rasterData = Array.isArray(raster) ? raster[0] : raster;

      const png = new PNG({ width, height });

      for (let i = 0; i < rasterData.length; i++) {
        const actualValue = rasterData[i] * 0.01; // Value in mm/h

        // Make all non-rain values completely transparent
        if (actualValue < 0.1) {
          png.data[i * 4] = 0; // R
          png.data[i * 4 + 1] = 0; // G
          png.data[i * 4 + 2] = 0; // B
          png.data[i * 4 + 3] = 0; // A - Fully transparent
        } else if (actualValue > 645) {
          png.data[i * 4] = 0; // R
          png.data[i * 4 + 1] = 0; // G
          png.data[i * 4 + 2] = 0; // B
          png.data[i * 4 + 3] = 0; // A - Fully transparent
        } else {
          const [r, g, b, a] = getColor(actualValue);
          png.data[i * 4] = r;
          png.data[i * 4 + 1] = g;
          png.data[i * 4 + 2] = b;
          png.data[i * 4 + 3] = a;
        }
      }

      const buffer = PNG.sync.write(png);

      const key = storageKey(frame.time);

      const up = await supabaseAdmin.storage
        .from("radar_images")
        .upload(key, buffer, {
          contentType: "image/png",
          cacheControl: "31536000",
          upsert: true,
        });

      if (up.error) {
        console.error(up.error.message);
        continue;
      }

      const [originX, originY] = image.getOrigin();
      const [resX, resY] = image.getResolution();
      const minX = originX;
      const maxY = originY;
      const maxX = originX + width * resX;
      const minY = originY - height * resY;

      const coords = [minX, minY, maxX, maxY];

      rowsToInsert.push({
        ts: frame.time,
        path: key,
        coords,
      });
    }

    if (rowsToInsert.length > 0) {
      const { error } = await supabaseAdmin
        .from("radar_frames")
        .upsert(rowsToInsert, { onConflict: "ts" });

      if (error) {
        console.error("Error inserting radar frames:", error);
      }
    }

    return NextResponse.json({
      inserted: rowsToInsert.length,
    });
  } catch (error) {
    console.error("Error fetching radar data:", error); // Log the error
    return NextResponse.json(
      { error: "Failed to fetch radar data" },
      { status: 500 }
    );
  }
}
