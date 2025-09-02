"use client";

import WeatherHighlights from "./weatherHighlights";
import useSWR from "swr";
import Spinner from "./spinner";
import { report } from "process";

export default function WeatherReportGPT() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error, isLoading } = useSWR("/api/weatherReportGPT", fetcher, {
    dedupingInterval: 5 * 60 * 1000,
    revalidateOnFocus: false, // do not refetch on window/tab focus
    revalidateOnReconnect: false, // do not refetch on network reconnect
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
      <div className="xl:w-[28rem] md-plus:w-[760px] h-full bg-blue-200 md-plus:rounded-xl p-8 pb-10 border-b-2 md-plus:border-2 border-gray-100 dark:bg-slate-950 dark:text-gray-100">
        <div className="flex flex-col items-center mb-10">
          <div className=" mt-5 text-center">
            <h2 className="text-xl text-gray-800  dark:text-gray-100 font-bold">
              Weather Report Today
            </h2>
          </div>
          {error && (
            <p className="text-sm text-gray-500 my-20">
              Failed to load weather report!
            </p>
          )}

          {isLoading && (
            <div className="flex justify-center mt-20">
              <Spinner />
            </div>
          )}

          {!isLoading && !error && data && (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-400 mt-2 mb-10">
                {createdAt}
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-100">
                {data.report}
              </p>
            </>
          )}
        </div>
        <WeatherHighlights />
      </div>
    </>
  );
}
