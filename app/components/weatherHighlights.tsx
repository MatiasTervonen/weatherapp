"use client";

import generateWeatherReport from "@/app/lib/generateWeatherReport";
import { WeatherData } from "@/types/weather";
import { useQuery } from "@tanstack/react-query";
import { getWeatherSummary } from "../database/weatherSummary";

export default function WeatherHighlights() {
  const { data, error } = useQuery({
    queryKey: ["weatherSummary-Weather"],
    queryFn: getWeatherSummary,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (error || !data?.summary || data.summary.length === 0) {
    return <div></div>;
  }

  const summary: WeatherData[] = data.summary;

  const { hottest, coldest } = generateWeatherReport(summary);

  return (
    <div className="flex flex-col gap-4 text-gray-800 dark:text-gray-100 text-lg">
      <div>
        Hottest Location: {hottest.locations.join(", ")} with {hottest.temp}°C
      </div>
      <div>
        Coldest Location: {coldest.locations.join(", ")} with {coldest.temp}°C
      </div>
    </div>
  );
}
