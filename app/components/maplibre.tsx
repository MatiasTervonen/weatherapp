"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import proj4 from "proj4";
import useSWR from "swr";
import { fromUrl } from "geotiff"; // Import GeoTIFF parser

// Define Coordinate Transformations
proj4.defs(
  "EPSG:3067",
  "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

function transformCoord(x: number, y: number) {
  // Convert EPSG:3067 (meters) → EPSG:4326 (Latitude/Longitude)
  let [lon, lat] = proj4("EPSG:3067", "EPSG:4326", [x, y]);

  return [lon, lat]; // Return EPSG:4326 (Lat/Lon) for markers
}

// Convert `bbox` to EPSG:3857
function transformBbox(bbox: number[]) {
  const [minX, minY, maxX, maxY] = bbox;
  const [newMinX, newMinY] = transformCoord(minX, minY);
  const [newMaxX, newMaxY] = transformCoord(maxX, maxY);

  return [newMinX, newMinY, newMaxX, newMaxY];
}

export default function Maplibre() {
  const mapContainer = useRef(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [geoTIFFData, setGeoTIFFData] = useState<{
    url: string;
    gain: number;
    bbox: number[];
    vectorX: number[];
    vectorY: number[];
  } | null>(null);

  // Fetch Radar Data
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR("/api/radar", fetcher);

  //  Process data when it's loaded
  useEffect(() => {
    if (!data || isLoading || error) return;

    // Convert bbox coordinates
    const transformedData = data.map((radar: any) => {
      const transformedBbox = transformBbox(radar.bbox);

      return {
        time: new Date(radar.time).toLocaleTimeString(),
        bbox: transformedBbox,
        imageUrl: radar.url,
        gain: radar.gain,
        offset: radar.offset,
        vectorX: radar.vectorX,
        vectorY: radar.vectorY,
      };
    });

    setProcessedData(transformedData);

    // Pick first GeoTIFF file for testing
    if (transformedData.length > 0) {
      setGeoTIFFData({
        url: transformedData[0].imageUrl,
        bbox: transformedData[0].bbox,
        gain: transformedData[0].gain,
        vectorX: transformedData[0].vectorX,
        vectorY: transformedData[0].vectorY,
      });
    }
  }, [data, isLoading, error]);

  // Initialize Map
  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [24.9384, 60.1695],
        zoom: 7,
      });
    }
  }, []); // Empty dependency: initialize map once

  useEffect(() => {
    if (!map.current || !geoTIFFData) return;

    const onMapLoad = () => {
      loadGeoTIFF(
        geoTIFFData.url,
        geoTIFFData.bbox,
        geoTIFFData.gain,
        geoTIFFData.vectorX,
        geoTIFFData.vectorY
      );
    };

    if (map.current.isStyleLoaded()) {
      onMapLoad(); // Map already loaded, run immediately
    } else {
      map.current.on("load", onMapLoad); // Wait for load
      return () => {
        if (map.current) {
          map.current.off("load", onMapLoad); // Cleanup
        }
      };
    }
  }, [geoTIFFData]); // Run when geoTIFFData changes

  //  Function to Load and Convert GeoTIFF to Image
  async function loadGeoTIFF(
    url: string,
    bbox: number[],
    gain: number,
    vectorX: number[],
    vectorY: number[]
  ) {
    try {
      const smallerUrl = url
        .replace(/width=\d+/, "width=994")
        .replace(/height=\d+/, "height=1572");
      const tiff = await fromUrl(smallerUrl); // Load GeoTIFF file

      const image = await tiff.getImage(); // Extract first image from GeoTIFF

      const width = image.getWidth();
      const height = image.getHeight();

      const raster = await image.readRasters();

      // Ensure `raster` is a valid TypedArray
      const rasterData = Array.isArray(raster) ? raster[0] : raster;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context");
        return;
      }
      const imgData = ctx.createImageData(width, height);

      const colors = [
        [0, 0, 255], // Light Rain - Blue
        [0, 255, 0], // Moderate Rain - Green
        [255, 255, 0], // Heavy Rain - Yellow
        [255, 165, 0], // Intense Rain - Orange
        [255, 0, 0], // Extreme Rain - Red
      ];

      function getColor(value: number) {
        let index = Math.min(
          Math.floor(value * (colors.length - 1)),
          colors.length - 1
        );
        return colors[index];
      }

      for (let i = 0; i < rasterData.length; i++) {
        let actualValue = rasterData[i] * gain; // Scale data

        if (actualValue < 1) {
          // Make background transparent
          imgData.data[i * 4] = 0; // Red
          imgData.data[i * 4 + 1] = 0; // Green
          imgData.data[i * 4 + 2] = 0; // Blue
          imgData.data[i * 4 + 3] = 0; // Fully transparent
        } else {
          //  Map intensity to colors
          let [r, g, b] = getColor(actualValue / 100); // Normalize value (0-1)
          imgData.data[i * 4] = r;
          imgData.data[i * 4 + 1] = g;
          imgData.data[i * 4 + 2] = b;
          imgData.data[i * 4 + 3] = 255; // Opaque
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const pngUrl = canvas.toDataURL("image/png"); // Convert to PNG

      const [minX, minY, maxX, maxY] = bbox;

      console.log(minX, minY, maxX, maxY);

      if (map.current) {
        // Remove previous GeoTIFF layer if exists
        if (map.current.getSource("geotiff")) {
          map.current.removeLayer("geotiff-layer");
          map.current.removeSource("geotiff");
        }

        // Add new GeoTIFF as an image overlay
        map.current.addSource("geotiff", {
          type: "image",
          url: pngUrl,
          coordinates: [
            [minX, maxY], // Top-left
            [maxX, maxY], // Top-right
            [maxX, minY], // Bottom-right
            [minX, minY], // Bottom-left
          ],
        });

        map.current.addLayer({
          id: "geotiff-layer",
          type: "raster",
          source: "geotiff",
          paint: {
            "raster-opacity": 0.8,
          },
        });
      }

      console.log("GeoTIFF successfully added to the map.");
    } catch (error) {
      console.error("Error loading GeoTIFF:", error);
    }
  }

  return (
    <>
      <div ref={mapContainer} className="w-[600px] h-[600px] border" />

      {/* Display Processed Data */}
      <div className="mt-4 p-2 border border-gray-300 bg-black/50 text-white">
        <h2 className="text-lg font-bold">Radar Data:</h2>
        {processedData.map((radar, index) => (
          <div key={index} className="p-2 border-b border-gray-500">
            <p>🕒 Time: {radar.time}</p>
            <button
              onClick={() =>
                loadGeoTIFF(
                  radar.imageUrl,
                  radar.bbox,
                  radar.gain,
                  radar.vectorX,
                  radar.vectorY
                )
              }
              className="text-blue-300 underline"
            >
              View Radar Image on Map
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
