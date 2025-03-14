"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WeatherMapSkeleton } from "../ui/skeleton";

interface WeatherData {
  time: string;
  smartData?: number | null;
  temperature?: number | null;
  windSpeed?: number | null;
  location: string;
}

// Define city positions on your map (adjust these based on your image)
const cityPositions: { [key: string]: { top: string; left: string } } = {
  Helsinki: { top: "90%", left: "42%" },
  Turku: { top: "88%", left: "22%" },
  Oulu: { top: "50%", left: "58%" },
  Rovaniemi: { top: "40%", left: "45%" },
  Jyväskylä: { top: "76%", left: "48%" },
  Kuopio: { top: "62%", left: "70%" },
  Vaasa: { top: "75%", left: "21%" },
  Joensuu: { top: "75%", left: "80%" },
  Lappeenranta: { top: "85%", left: "65%" },
  Ylivieska: { top: "65%", left: "45%" },
  Muonio: { top: "26%", left: "40%" },
  Utsjoki: { top: "12%", left: "63%" },
  Salla: { top: "35%", left: "65%" },
};

export default function FinlandWeatherMap() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);

  useEffect(() => {
    let skeletonTimer: NodeJS.Timeout;

    async function fetchWeather() {
      skeletonTimer = setTimeout(() => {
        setShowSkeleton(true); // Show skeleton only if it takes longer than 500ms
      }, 500);

      try {
        const res = await fetch("/api/weatherRealTime"); // Ensure this API exists
        const data = await res.json();
        setWeatherData(data);

        console.log(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        clearTimeout(skeletonTimer); // Cancel skeleton if data loads fast
        setShowSkeleton(false);
        setLoading(false); //  Set loading to false after data fetch
      }
    }
    fetchWeather();
  }, []);

  const getTempColor = (temp: number | null | undefined) => {
    if (temp === null || temp === undefined) return "text-blue-950"; // Default color for N/A
    return temp >= 0 ? "text-red-500" : "text-blue-400";
  };

  return (
    <div className="relative w-full h-[600px]">
      {/* Finland Map as Background */}

      <Image
        src="/Cropped Finland Map.png" // Replace with your map image path
        width={256}
        height={612}
        alt="Finland Map"
        className="w-full h-full object-contain"
        priority={true}
      />

      {/* Show Skeleton While Loading */}
      {showSkeleton && <WeatherMapSkeleton />}

      {/* Overlay Weather Data on the Map */}

      {!loading &&
        weatherData.map((cityData) => {
          const position = cityPositions[cityData.location];
          if (!position) return null; // Skip cities without coordinates

          // Only set image path if SmartSymbol exists and is valid
          const smartSymbolImage =
            cityData.smartData !== null && cityData.smartData !== undefined
              ? `/weathericons/${cityData.smartData}.svg`
              : null; // Set to null instead of empty string

          return (
            <div
              key={cityData.location}
              className="absolute text-xs"
              style={{
                top: position.top,
                left: position.left,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="text-white text-sm">
                <p
                  className={` font-bold ${getTempColor(cityData.temperature)}`}
                >
                  {cityData.temperature ?? "N/A"}°C
                </p>
                {/* Render Image ONLY if smartSymbolImage is valid */}
                {smartSymbolImage && (
                  <Image
                    src={smartSymbolImage}
                    alt={`Weather icon ${cityData.smartData}`}
                    width={50}
                    height={50}
                    onError={(e) => {
                      e.currentTarget.style.display = "none"; // Hide if broken
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
