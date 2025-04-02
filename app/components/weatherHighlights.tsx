"use client";

import { useState, useEffect } from "react";
import generateWeatherReport from "../lib/generateWeatherReport";
import { WeatherData } from "@/types/weather";
import { supabaseClient } from "../lib/supabaseClient";

export default function WeatherHighlights() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabaseClient
        .from("weather_summary")
        .select("summary")
        .eq("date", today)
        .single();

      if (error) {
        console.error("Error fetching weather data:", error);
      } else if (data?.summary) {
        console.log("✅ Full weather summary:", data.summary);
        setWeatherData(data.summary);
      }
      setLoading(false);
    };
    fetchWeather();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (weatherData.length === 0) {
    return <div></div>;
  }

  console.log("Weather data being analyzed:", weatherData);

  const { hottest, coldest } = generateWeatherReport(weatherData);

  console.log("Hottest Location:", hottest);
  console.log("Coldest Location:", coldest);

  return (
    <div className="flex flex-col gap-4 text-lg">
      <div>
        Hottest Location: {hottest.locations.join(", ")} with {hottest.temp}°C
      </div>
      <div>
        Coldest Location: {coldest.locations.join(", ")} with {coldest.temp}°C
      </div>
    </div>
  );
}
