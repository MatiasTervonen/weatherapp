"use client";

import { useEffect, useState } from "react";
import { getLatestWeatherData } from "@/app/lib/weather";
import { rubik } from "@/app/ui/fonts";
import Image from "next/image";

interface WeatherData {
  time: string;
  smartData?: number | null;
  temperature?: number | null;
  windSpeed?: number | null;
  location?: string;
}

export default function LatestWeatherData() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    async function loadWeather() {
      const latestWeather = await getLatestWeatherData();
      if (latestWeather) setWeather(latestWeather);
    }

    loadWeather();

    const interval = setInterval(loadWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get the correct image path from /public/weathericons/
  const smartSymbolImage = weather?.smartData
    ? `/weathericons/${weather.smartData}.svg`
    : "error loading image"; // Fallback if no SmartSymbol is available

  return (
    <div>
      {weather ? (
        <div className=" flex justify-center">
          <div
            className={`${rubik.className} bg-blue-400 text-white text-xl p-10 rounded-xl`}
          >
            <p>{weather.location}</p>
            <p>{new Date(weather.time).toLocaleString()} </p>
            <p>
              <strong>Temperature: </strong> {weather.temperature ?? "N/A"} °C
            </p>

            <p>
              <strong>Wind Speed: </strong>
              {weather.windSpeed ?? "N/A"} m/s
            </p>
            <div className="mt-4">
              <Image
                src={smartSymbolImage}
                alt={`Weather icon ${weather.smartData}`}
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}
