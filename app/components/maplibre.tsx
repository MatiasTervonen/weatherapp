"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import proj4 from "proj4";
import useSWR from "swr";
import { fromUrl } from "geotiff"; // Import GeoTIFF parser

interface RadarData {
  time: string;
  url: string;
}

export default function Maplibre() {
  const mapContainer = useRef(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0); // Track slider index
  const [processedData, setProcessedData] = useState<RadarData[]>([]);

  // Fetch Radar Data
  const fetcher = (url: string): Promise<RadarData[]> =>
    fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR<RadarData[]>("/api/radar", fetcher);

  //  Process data when it's loaded
  useEffect(() => {
    if (!data || isLoading || error) return;

    const transformedData = data.map((radar: RadarData) => {
      const date = new Date(radar.time);

      // Format weekday in English (en-GB)
      const weekday = date.toLocaleDateString("en-GB", {
        weekday: "short", // "Wed"
        timeZone: "Europe/Helsinki",
      });

      // Format date in Finnish (fi-FI)
      const datePart = date.toLocaleDateString("fi-FI", {
        day: "numeric", // "12"
        month: "numeric", // "3"
        timeZone: "Europe/Helsinki",
      });

      // Format time in 24-hour format
      const formattedTime = date.toLocaleTimeString("fi-FI", {
        timeZone: "Europe/Helsinki",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        time: `${weekday} ${datePart} ${formattedTime}`,
        url: radar.url,
      };
    });

    setProcessedData(transformedData);
  }, [data, isLoading, error]);

  // Load GeoTIFF when selectedIndex changes
  useEffect(() => {
    if (processedData.length > 0) {
      loadGeoTIFF(processedData[selectedIndex].url);
    }
  }, [selectedIndex, processedData]);

  // Initialize Map
  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [26.9384, 64.1695],
        zoom: 5,
      });
    }
    // Load the latest radar image once data is available
    if (data && !isLoading && !error && data.length > 0) {
      const latestRadar = data[data.length - 1]; // Get the most recent radar entry
      loadGeoTIFF(latestRadar.url);
    }
  }, [data, isLoading, error]); // Runs when `data` updates

  //  Function to Load and Convert GeoTIFF to Image

  async function loadGeoTIFF(url: string) {
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

      console.log("rasterData", rasterData);

      const transformedRasterData = new Float32Array(rasterData.length);

      for (let i = 0; i < rasterData.length; i++) {
        transformedRasterData[i] = rasterData[i] * 0.01; // Convert pixel values to mm/h
      }

      console.log("raster transformed", transformedRasterData);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context");
        return;
      }
      const imgData = ctx.createImageData(width, height);

      const bbox = image.getBoundingBox();

      console.log("bbox from", bbox);

      //  [-118331.366, 6335621.167, 875567.732, 7907751.537]

      // Define projection transformation

      proj4.defs(
        "EPSG:3067",
        "+proj=utm +zone=35 +ellps=GRS80 +datum=ETRS89 +units=m +no_defs"
      );

      proj4.defs(
        "EPSG:4326",
        "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
      );

      // Convert to EPSG:4326 with MapLibre GL order: [top-left, top-right, bottom-right, bottom-left]
      const bboxLatLng: [
        [number, number],
        [number, number],
        [number, number],
        [number, number]
      ] = [
        proj4("EPSG:3067", "EPSG:4326", [bbox[0], bbox[3]]), // Top-left
        proj4("EPSG:3067", "EPSG:4326", [bbox[2], bbox[3]]), // Top-right
        proj4("EPSG:3067", "EPSG:4326", [bbox[2], bbox[1]]), // Bottom-right
        proj4("EPSG:3067", "EPSG:4326", [bbox[0], bbox[1]]), // Bottom-left
      ];

      console.log("Bbbox converted", bboxLatLng);

      //  0 = [10.215443143427365, 70.49992323660285]
      // 1 = [37.3716599948539, 70.98305999773656]
      // 2 = [33.18909391504072, 57.010733190847425]
      // 3 = [16.867430017688033, 56.75132000224553]

      function getColor(value: number) {
        if (value < 0.1) return [0, 0, 0, 0]; // Fully transparent
        if (value < 1.0) return [50, 150, 255, 220]; // Blue (Very Light Rain)
        if (value < 5.0) return [100, 255, 150, 230]; // Light Green (Light Rain)
        if (value < 10.0) return [50, 200, 50, 240]; // Green (Moderate Rain)
        if (value < 20.0) return [255, 255, 100, 255]; // Yellow (Heavy Rain)
        if (value < 50.0) return [255, 165, 50, 255]; // Orange (Very Heavy Rain)
        if (value < 100.0) return [255, 100, 100, 255]; // Light Red (Extreme Rain)
        return [200, 0, 0, 255]; // Red (Severe Rain)
      }

      for (let i = 0; i < rasterData.length; i++) {
        const actualValue = rasterData[i]; // Value in mm/h

        // Make all non-rain values completely transparent
        if (actualValue < 0.01) {
          imgData.data[i * 4] = 0; // R
          imgData.data[i * 4 + 1] = 0; // G
          imgData.data[i * 4 + 2] = 0; // B
          imgData.data[i * 4 + 3] = 0; // A - Fully transparent
        } else if (actualValue > 645) {
          imgData.data[i * 4] = 30; // R
          imgData.data[i * 4 + 1] = 30; // G
          imgData.data[i * 4 + 2] = 30; // B
          imgData.data[i * 4 + 3] = 50; // A - Fully transparent
        } else {
          const [r, g, b] = getColor(actualValue);
          imgData.data[i * 4] = r;
          imgData.data[i * 4 + 1] = g;
          imgData.data[i * 4 + 2] = b;
          imgData.data[i * 4 + 3] = Math.min(255, actualValue * 15 + 80);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");

      if (map.current) {
        // Remove previous layers if exist
        if (map.current?.getSource("geotiff")) {
          map.current.removeLayer("geotiff-layer");
          map.current.removeSource("geotiff");
        }

        // Add new GeoTIFF as an image overlay
        map.current.addSource("geotiff", {
          type: "image",
          url: pngUrl,
          coordinates: bboxLatLng,
        });

        map.current.addLayer({
          id: "geotiff-layer",
          type: "raster",
          source: "geotiff",
          paint: {
            "raster-opacity": 0.8, // Full opacity for the layer
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
      <div className="flex justify-center flex-col">
        <div className="flex justify-center mb-10 bg-blue-200 py-2 rounded-xl">
          <h2 className="text-gray-600 font-bold text-4xl">Rain radar</h2>
        </div>

        {/* Error hadnling */}
        {error && (
          <div className="flex justify center items-center border-2 bg-blue-200 text-red-700">
            <p className="font-bold p-2">Error loading radar data!</p>
            <p>{error.message || "Please try again later."}</p>
          </div>
        )}

        {/* map container */}
        {!error && (
          <div ref={mapContainer} className="w-[600px] h-[600px] border"></div>
        )}

        {/* Display Processed Data */}

        {!error && (
          <div className="p-2 border border-gray-300 bg-black/50 text-white flex flex-col justify-center items-center">
            {processedData.length > 0 && (
              <h2 className="text-lg font-bold">
                {processedData[selectedIndex].time}
              </h2>
            )}

            {/* Slider */}
            {processedData.length > 0 && (
              <input
                type="range"
                min="0"
                max={processedData.length - 1}
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="w-80 mt-2 mb-4"
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
