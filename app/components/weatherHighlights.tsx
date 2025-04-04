"use client";

import { useState, useEffect } from "react";
import generateWeatherReport from "@/app/lib/generateWeatherReport";
import { WeatherData } from "@/types/weather";
import { supabaseClient } from "@/app/lib/supabaseClient";

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

  const { hottest, coldest } = generateWeatherReport(weatherData);

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
