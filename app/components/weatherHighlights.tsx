"use client";

import generateWeatherReport from "@/app/lib/generateWeatherReport";
import { WeatherData } from "@/types/weather";
import useSWR from "swr";

export default function WeatherHighlights() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(`/api/weatherSummary`, fetcher, {
    dedupingInterval: 5 * 60 * 1000,
    revalidateOnFocus: false, // do not refetch on window/tab focus
    revalidateOnReconnect: false, // do not refetch on network reconnect
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
