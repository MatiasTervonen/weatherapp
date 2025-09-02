import { supabaseClient } from "@/utils/supabase/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseClient
    .from("radar_frames")
    .select("ts, path, coords")
    .limit(12);

  if (error) {
    console.error("Error fetching radar frames:", error);
    return new Response("Error fetching radar frames", { status: 500 });
  }

  const radarData = data.map((item) => ({
    ...item,
    path: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/radar_images/${item.path}`,
  }));

  return NextResponse.json(radarData);
}
