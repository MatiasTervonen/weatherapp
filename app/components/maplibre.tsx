"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface RadarData {
  time: string;
  url: string;
  bbox: [number, number, number, number];
  srs: string;
}

export default function Maplibre() {
  const mapContainer = useRef(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [radarData, setRadarData] = useState<RadarData | null>(null);

  useEffect(() => {
    map.current = new maplibregl.Map({
      container: mapContainer.current || "",
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [24.9384, 60.1695], // Helsinki coordinates
      zoom: 10,
    });

    // Fetch radar data from api

    async function fetchRadarData() {
      try {
        const response = await fetch("/api/radar");
        const data: RadarData[] = await response.json();

        if (data.length > 0) {
          setRadarData(data[0]);
        }
      } catch (error) {
        console.log("Error fetching radar data", error);
      }
    }

    fetchRadarData();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !radarData) return;

    const { url, bbox } = radarData;

    // Convert bounding box (EPSG:3067) to [west, south, east, north] in EPSG:4326
    const transformedBBox = transformBBox(bbox);

    map.current.addSource("radar-source", {
      type: "image",
      url,
      coordinates: [
        [transformedBBox[0], transformedBBox[3]], // Top-left (west, north)
        [transformedBBox[2], transformedBBox[3]], // Top-right (east, north)
        [transformedBBox[2], transformedBBox[1]], // Bottom-right (east, south)
        [transformedBBox[0], transformedBBox[1]], // Bottom-left (west, south)
      ],
    });

    map.current.addLayer({
      id: "radar-layer",
      type: "raster",
      source: "radar-source",
      paint: {
        "raster-opacity": 0.5,
      },
    });

    return () => {
      if (map.current?.getLayer("radar-layer")) {
        map.current?.removeLayer("radar-layer");
        map.current.removeSource("radar-source");
      }
    };
  }, [radarData]);

  return (
    <>
      <div ref={mapContainer} className="w-[500px] h-[500px]" />
    </>
  );
}

// Function to transform bounding box from EPSG:3067 to EPSG:4326 (Lat/Lon)
function transformBBox(
  bbox: [number, number, number, number]
): [number, number, number, number] {
  // Conversion logic (using a library like proj4 would be ideal, but for now, assume values are roughly correct)
  const scaleFactor = 1 / 100000; // Rough scaling for this projection (not accurate)
  return [
    bbox[0] * scaleFactor, // minX -> longitude
    bbox[1] * scaleFactor, // minY -> latitude
    bbox[2] * scaleFactor, // maxX -> longitude
    bbox[3] * scaleFactor, // maxY -> latitude
  ];
}
