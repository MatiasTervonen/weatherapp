"use client";

import WeatherHighlights from "./weatherHighlights";
import Spinner from "./spinner";
import { useQuery } from "@tanstack/react-query";
import { getWeatherReportGPT } from "../database/weatherReportGPT";

export default function WeatherReportGPT() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["ReportGPT-Weather"],
    queryFn: getWeatherReportGPT,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const createdAt = data?.created_at
    ? new Date(data.created_at).toLocaleString("fi-FI", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Helsinki",
      })
    : null;

  return (
    <>
      <div className="xl:w-md md-plus:w-[760px] h-full bg-blue-200 md-plus:rounded-xl p-8  border-b-2 md-plus:border-2 border-gray-100 dark:bg-slate-950 dark:text-gray-100">
        <div className="text-center">
          <h2 className="text-xl text-gray-800  dark:text-gray-100 font-bold">
            Weather Report Today
          </h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center mt-20">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-sm text-gray-500 my-20">
            Failed to load weather report!
          </p>
        ) : (
          data && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-700 dark:text-gray-400 mt-2 mb-10">
                {createdAt}
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-100 mb-10">
                {data.report}
              </p>
              <WeatherHighlights />
            </div>
          )
        )}
      </div>
    </>
  );
}
