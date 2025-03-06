"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Maplibre() {
  const mapContainer = useRef(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current || "",
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [24.9384, 60.1695], // Helsinki coordinates
      zoom: 10,
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return <div ref={mapContainer} style={{ width: "500px", height: "500px" }} />;
}
