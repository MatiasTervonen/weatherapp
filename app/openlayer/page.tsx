"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Spinner from "@/app/components/spinner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Play, Pause } from "lucide-react";

// OpenLayers imports
import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import ImageStatic from "ol/source/ImageStatic";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { fromLonLat } from "ol/proj";
import XYZ from "ol/source/XYZ";

type RadarFrame = {
  ts: string;
  path: string;
  coords: [number, number, number, number];
};

// define EPSG:3067 (ETRS-TM35FIN)
proj4.defs(
  "EPSG:3067",
  "+proj=utm +zone=35 +ellps=GRS80 +datum=ETRS89 +units=m +no_defs"
);

// register it into OpenLayers
register(proj4);

export default function RadarOpenLayers() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const radarLayerRef = useRef<ImageLayer<ImageStatic> | null>(null);
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const {
    data: radarData,
    error,
    isLoading,
  } = useSWR("/api/radar", fetcher);


  console.log("Radar Data:", radarData);

  const processedData = useMemo(() => {
    if (!radarData) return [];
    return radarData.map((radar: RadarFrame) => {
      const date = new Date(radar.ts);
      const weekday = date.toLocaleDateString("en-GB", {
        weekday: "short",
        timeZone: "Europe/Helsinki",
      });
      const formattedTime = date.toLocaleTimeString("fi-FI", {
        timeZone: "Europe/Helsinki",
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        time: `${weekday} ${formattedTime}`,
        url: radar.path, // must be a public URL to the PNG
        coords: radar.coords,
      };
    });
  }, [radarData]);

  // Preload images and cache them

  useEffect(() => {
    if (processedData.length === 0) return;

    processedData.forEach((frame: { url: string }) => {
      const img = new window.Image();
      img.src = frame.url;
    });
  }, [processedData]);

  // Initialize OpenLayers map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (mapRef.current) return;

    const map = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-d}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png",
            attributions:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://www.carto.com/">CARTO</a>',
            crossOrigin: "anonymous",
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([25.0, 63.0]),
        zoom: 6,
        projection: "EPSG:3857",
      }),
    });

    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      radarLayerRef.current = null;
    };
  }, []);

  // Update radar image layer when selectedIndex changes
  useEffect(() => {
    if (!mapRef.current || processedData.length === 0) return;

    const frame = processedData[selectedIndex];
    if (!frame) return;

    if (!radarLayerRef.current) {
      radarLayerRef.current = new ImageLayer();
      mapRef.current.addLayer(radarLayerRef.current);
    }

    // Add radar image layer
    radarLayerRef.current.setSource(
      new ImageStatic({
        url: frame.url,
        imageExtent: frame.coords,
        projection: "EPSG:3067",
        crossOrigin: "anonymous",
      })
    );
  }, [selectedIndex, processedData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedIndex((prevIndex) => {
        if (!isPlaying) return prevIndex;
        const nextIndex = prevIndex + 1;
        return nextIndex < processedData.length ? nextIndex : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, processedData.length]);

  return (
    <div className="fixed inset-0 flex flex-col sm:max-w-[600px] sm:max-h-[800px] sm:mt-60 sm:mx-auto">
      <div ref={mapContainer} className="w-full h-full" />

      {error && (
        <div className="flex items-center justify-center absolute inset-0 z-10 bg-gray-100/50">
          <p className="p-2 text-gray-900">Error loading radar data!</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center absolute inset-0 z-10 bg-gray-100/50">
          <Spinner />
        </div>
      )}

      {!isLoading && !error && processedData.length > 0 && (
        <>
          <h2 className="text-lg bg-slate-950 px-4 py-1 rounded-xl absolute left-1/2 sm:top-5 top-40 -translate-x-1/2">
            {processedData[selectedIndex].time}
          </h2>

          <button
            onClick={() => router.back()}
            className="sm:hidden absolute left-5 top-40"
          >
            <Image src="/Back-Arrow.png" width={40} height={40} alt="Close" />
          </button>
          <div className="p-2 border border-gray-300 bg-black/50 text-white flex flex-col justify-center items-center">
            {processedData.length > 0 && (
              <h2 className="text-lg">{processedData[selectedIndex].time}</h2>
            )}
            {processedData.length > 0 && (
              <div className="flex items-center gap-5 mb-5">
                <button
                  className="border rounded-full p-2"
                  onClick={() => setIsPlaying((prev) => !prev)}
                >
                  {!isPlaying ? <Play /> : <Pause />}
                </button>
                <input
                  type="range"
                  min="0"
                  max={processedData.length - 1}
                  value={selectedIndex}
                  onChange={(e) => setSelectedIndex(Number(e.target.value))}
                  className="rounded-xl focus:ring-2 focus:ring-blue-500 w-60 sm:w-96 appearance-none"
                  style={{
                    background: `linear-gradient(to right, 
                    #3b82f6 ${
                      (selectedIndex / (processedData.length - 1)) * 100
                    }%, 
                    #e5e7eb ${
                      (selectedIndex / (processedData.length - 1)) * 100
                    }%)`,
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
