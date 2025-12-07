"use client";

import { useTranslation } from "@/app/lib/useTranslation";
import { useState, useEffect } from "react";
import DateTimeDisplay from "./datetime";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { getWeatherTomorrow } from "../database/weatherTomorrow";
import { getWeatherDayAfterTomorrow } from "../database/weatherDayAfterTomorrow";
import { getRadar } from "../database/radar";

export default function WeatherMapSwitcher({
  maps,
}: {
  maps: {
    today: React.ReactNode;
    tomorrow: React.ReactNode;
    dayaftertomorrow: React.ReactNode;
  };
}) {
  const [activeMap, setActiveMap] = useState("today");

  const queryClient = useQueryClient();

  useEffect(() => {
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["Tomorrow-Weather"],
        queryFn: getWeatherTomorrow,
        staleTime: Infinity,
        gcTime: Infinity,
      }),
      queryClient.prefetchQuery({
        queryKey: ["DayAfterTomorrow-Weather"],
        queryFn: getWeatherDayAfterTomorrow,
        staleTime: Infinity,
        gcTime: Infinity,
      }),
      queryClient.prefetchQuery({
        queryKey: ["radar"],
        queryFn: getRadar,
        staleTime: Infinity,
        gcTime: Infinity,
      }),
    ]);
  }, [queryClient]);

  const { t } = useTranslation("mapswitcher");

  return (
    <>
      <div className=" flex flex-col-reverse md-plus:gap-5 justify-center md-plus:flex-row">
        <div className="bg-blue-200 flex flex-col md-plus:rounded-xl md-plus:pl-2 md-plus:w-[320px] justify-between  border-y-2 md-plus:border-2 border-gray-100 dark:bg-slate-950 dark:text-gray-100">
          <div className="flex flex-wrap justify-center md-plus:flex-col ">
            <div className="p-5 text-xl text-gray-800 h-[68px] hidden md-plus:block dark:text-gray-100">
              <DateTimeDisplay />
            </div>
            <div className="p-7 text-xl font-bold text-nowrap ">
              <button
                onClick={() => setActiveMap("today")}
                className={`${
                  activeMap === "today"
                    ? "text-blue-700 underline"
                    : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {t("weatherNow")}
              </button>
            </div>
            <div className="p-7 text-xl font-bold text-nowrap">
              <button
                onClick={() => setActiveMap("tomorrow")}
                className={` ${
                  activeMap === "tomorrow"
                    ? "text-blue-700 underline"
                    : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {t("tomorrow")}
              </button>
            </div>
            <div className="p-7 text-xl font-bold text-nowrap">
              <button
                onClick={() => setActiveMap("dayaftertomorrow")}
                className={`${
                  activeMap === "dayaftertomorrow"
                    ? "text-blue-700 underline"
                    : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {t("dayAfterTomorrow")}
              </button>
            </div>
            <div className="p-7 text-xl font-bold text-nowrap text-gray-800 dark:text-gray-100">
              <Link href="/radar">{t("rainRadar")}</Link>
            </div>
          </div>
          <div className="p-5 text-center text-gray-800 dark:text-gray-100">
            <p>{t("dataProvider")}</p>
          </div>
        </div>
        <div className="flex justify-center ">
          <div className="md-plus:bg-blue-300 rounded-xl md-plus:border-2 md-plus:border-gray-100 py-5 md-plus:p-20 md-plus:dark:bg-slate-950">
            {maps[activeMap as keyof typeof maps]}
          </div>
        </div>
      </div>
    </>
  );
}
