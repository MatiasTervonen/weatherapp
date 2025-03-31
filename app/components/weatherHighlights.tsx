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

      console.log("Weather data fetched:", data);

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
    return <div>No weather data available</div>;
  }

  const { hottestLocation, coldestLocation } =
    generateWeatherReport(weatherData);

  return (
    <div className="flex flex-col  gap-4">
      <div>
        Hottest Location: {hottestLocation.loc} with {hottestLocation.temp}°C
      </div>
      <div>
        Coldest Location: {coldestLocation.loc} with {coldestLocation.temp}°C
      </div>
    </div>
  );
}
