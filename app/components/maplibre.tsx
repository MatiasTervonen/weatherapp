"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import proj4 from "proj4";
import * as geotiff from "geotiff";
import Spinner from "@/app/components/spinner";
import FooterMobile from "@/app/components/FooterMobile";

interface RadarData {
  time: string;
  url: string;
}

interface CachedImage {
  blobUrl: string;
  coordinates: [
    [number, number],
    [number, number],
    [number, number],
    [number, number]
  ];
}

export default function Maplibre({
  radarData,
  error,
}: {
  radarData: RadarData[];
  error?: string | null;
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cachedImages, setCachedImages] = useState<Map<number, CachedImage>>(
    new Map()
  ); // Cache for images
  const [loading, setLoading] = useState<boolean>(true);

  // Process radar data into display format

  const processedData = radarData.map((radar) => {
    const date = new Date(radar.time);
    const weekday = date.toLocaleDateString("en-GB", {
      weekday: "short",
      timeZone: "Europe/Helsinki",
    });
    const datePart = date.toLocaleDateString("fi-FI", {
      day: "numeric",
      month: "numeric",
      timeZone: "Europe/Helsinki",
    });
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

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [26.9384, 65.1695],
      zoom: 4,
    });

    // Cleans up the map when component goes away. Clears the memory etc...
    // Its called when the component unmounts
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Pre-process all GeoTIFFs when data is available
  useEffect(() => {
    if (!radarData || error || processedData.length === 0) return;

    const loadFirstAndPreloadOthers = async () => {
      setLoading(true);

      const first = await processGeoTIFF(processedData[0].url);
      const updatedCache = new Map(cachedImages);

      if (first && map.current) {
        updatedCache.set(0, first);
        setCachedImages(new Map(updatedCache));

        if (map.current.isStyleLoaded()) {
          addImageToMap(first.blobUrl, first.coordinates);
        } else {
          map.current?.once("styledata", () => {
            addImageToMap(first.blobUrl, first.coordinates);
          });
        }
      }

      setLoading(false);

      for (let i = 1; i < processedData.length; i++) {
        if (!cachedImages.has(i)) {
          const img = await processGeoTIFF(processedData[i].url);
          if (img) {
            updatedCache.set(i, img);
          }
        }
      }

      setCachedImages(new Map(updatedCache));
    };

    loadFirstAndPreloadOthers();
  }, [radarData, error]);

  // Load cached image to map when selectedIndex changes
  useEffect(() => {
    if (!map.current || !processedData[selectedIndex]) return;

    const cached = cachedImages.get(selectedIndex);

    if (cached) {
      addImageToMap(cached.blobUrl, cached.coordinates);
    } else {
      setLoading(true);
      processGeoTIFF(processedData[selectedIndex].url).then((img) => {
        if (img) {
          const updated = new Map(cachedImages);
          updated.set(selectedIndex, img);
          setCachedImages(updated);
          addImageToMap(img.blobUrl, img.coordinates);
        }
        setLoading(false);
      });
    }
  }, [selectedIndex, cachedImages]);

  // Process a single GeoTIFF and return cached data
  async function processGeoTIFF(url: string): Promise<CachedImage | null> {
    try {
      const smallerUrl = url
        .replace(/width=\d+/, "width=994")
        .replace(/height=\d+/, "height=1572");

      // Manual fetch to inspect response
      const response = await fetch(smallerUrl);
      if (!response.ok) {
        throw new Error(
          `Fetch failed with status ${response.status}: ${response.statusText}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();

      const tiff = await geotiff.fromArrayBuffer(arrayBuffer);

      const image = await tiff.getImage();
      const width = image.getWidth();
      const height = image.getHeight();
      const raster = await image.readRasters();
      const rasterData = Array.isArray(raster) ? raster[0] : raster;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get 2D context");

      const imgData = ctx.createImageData(width, height);
      const bbox = image.getBoundingBox();

      proj4.defs(
        "EPSG:3067",
        "+proj=utm +zone=35 +ellps=GRS80 +datum=ETRS89 +units=m +no_defs"
      );
      proj4.defs(
        "EPSG:4326",
        "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
      );

      const bboxLatLng: [
        [number, number],
        [number, number],
        [number, number],
        [number, number]
      ] = [
        proj4("EPSG:3067", "EPSG:4326", [bbox[0], bbox[3]]),
        proj4("EPSG:3067", "EPSG:4326", [bbox[2], bbox[3]]),
        proj4("EPSG:3067", "EPSG:4326", [bbox[2], bbox[1]]),
        proj4("EPSG:3067", "EPSG:4326", [bbox[0], bbox[1]]),
      ];

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
          imgData.data[i * 4] = 0; // R
          imgData.data[i * 4 + 1] = 0; // G
          imgData.data[i * 4 + 2] = 0; // B
          imgData.data[i * 4 + 3] = 0; // A - Fully transparent
        } else {
          const [r, g, b] = getColor(actualValue);
          imgData.data[i * 4] = r;
          imgData.data[i * 4 + 1] = g;
          imgData.data[i * 4 + 2] = b;
          imgData.data[i * 4 + 3] = Math.min(255, actualValue * 15 + 80);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Failed to generate PNG blob");

      return { blobUrl: URL.createObjectURL(blob), coordinates: bboxLatLng };
    } catch (error) {
      console.error("Error processing GeoTIFF:", error);
      return null;
    }
  }

  // Add pre-processed image to the map
  function addImageToMap(
    blobUrl: string,
    coordinates: [
      [number, number],
      [number, number],
      [number, number],
      [number, number]
    ]
  ) {
    if (!map.current) return;

    if (map.current.getSource("geotiff")) {
      map.current.removeLayer("geotiff-layer");
      if (map.current.getSource("geotiff")) {
        map.current.removeSource("geotiff");
      }
    }

    map.current.addSource("geotiff", {
      type: "image",
      url: blobUrl,
      coordinates,
    });

    map.current.addLayer({
      id: "geotiff-layer",
      type: "raster",
      source: "geotiff",
      paint: { "raster-opacity": 0.8 },
    });
  }

  // Cleanup cached URLs on unmount
  useEffect(() => {
    return () => {
      cachedImages.forEach((image) => URL.revokeObjectURL(image.blobUrl));
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow flex-col mx-auto sm:max-w-[600px] mt-10 min-w-screen">
        {error && (
          <div className="flex justify-center items-center w-[90vw] max-w-[600px] h-[90vw] max-h-[600px] border bg-white/50 text-red-700">
            <p className="font-bold p-2">Error loading radar data!</p>
            <p>{error || "Please try again later."}</p>
          </div>
        )}

        {!error && (
          <div className="relative w-[90vw] max-w-[600px] h-[50vh] border border-gray-300 ">
            <div
              ref={mapContainer}
              className="absolute inset-0 w-full h-full"
            />

            {loading && (
              <div className="absolute inset-0 flex justify-center items-center bg-white/50 z-10">
                <Spinner />
              </div>
            )}
          </div>
        )}

        {!error && (
          <div className="p-2 border border-gray-300 bg-black/50 text-white flex flex-col justify-center items-center w-[90vw] max-w-[600px]">
            {processedData.length > 0 && (
              <h2 className="text-lg font-bold">
                {processedData[selectedIndex].time}
              </h2>
            )}
            {processedData.length > 0 && (
              <input
                type="range"
                min="0"
                max={processedData.length - 1}
                value={selectedIndex}
                onChange={(e) => {
                  const newIndex = Number(e.target.value);

                  setSelectedIndex(newIndex);

                  const percent = (newIndex / (processedData.length - 1)) * 100;

                  e.target.style.background = `linear-gradient(to right, #3b82f6 ${percent}%, #d1d5db ${percent}%)`;
                }}
                className="rounded-xl focus:ring-2 focus:ring-blue-500 w-60 sm:w-96 mt-4 mb-4 appearance-none"
                disabled={cachedImages.size < processedData.length} // Disable until all images are cached
              />
            )}
          </div>
        )}
      </div>
      <div className="w-full">
        <FooterMobile />
      </div>
    </div>
  );
}
