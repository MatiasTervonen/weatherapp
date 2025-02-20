"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface WeatherData {
  time: string;
  smartData?: number | null;
  temperature?: number | null;
  windSpeed?: number | null;
  location: string;
}

// Define city positions on your map (adjust these based on your image)
const cityPositions: { [key: string]: { top: string; left: string } } = {
  Helsinki: { top: "90%", left: "50%" },
  Turku: { top: "88%", left: "40%" },
  Oulu: { top: "50%", left: "55%" },
  Rovaniemi: { top: "40%", left: "50%" },
  Jyväskylä: { top: "76%", left: "50%" },
  Kuopio: { top: "65%", left: "60%" },
  Vaasa: { top: "75%", left: "40%" },
  Joensuu: { top: "75%", left: "65%" },
  Lappeenranta: { top: "85%", left: "60%" },
  Ylivieska: { top: "65%", left: "48%" },
  Muonio: { top: "25%", left: "48%" },
  Utsjoki: { top: "12%", left: "58%" },
  Salla: { top: "35%", left: "60%" },
};

export default function FinlandWeatherMap() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  useEffect(() => {
    async function fetchWeather() {
      const res = await fetch("/api/weatherdayaftertomorrow"); // Ensure this API exists
      const data = await res.json();
      setWeatherData(data);
    }
    fetchWeather();
  }, []);

  return (
    <div className="relative w-full h-[600px]">
      {/* Finland Map as Background */}
      <Image
        src="/istockphoto-470863186-612x612.png" // Replace with your map image path
        width={600}
        height={600}
        alt="Finland Map"
        className="w-full h-full object-cover"
      />

      {/* Overlay Weather Data on the Map */}
      {weatherData.map((cityData) => {
        const position = cityPositions[cityData.location];
        if (!position) return null; // Skip cities without coordinates

        // Only set image path if SmartSymbol exists and is valid
        const smartSymbolImage =
          cityData.smartData !== null && cityData.smartData !== undefined
            ? `/weathericons/${cityData.smartData}.svg`
            : null; // Set to null instead of empty string

        console.log("Image Path for", cityData.location, ":", smartSymbolImage);

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
              <p>{cityData.temperature ?? "N/A"}°C</p>
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