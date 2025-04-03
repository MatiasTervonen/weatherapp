"use client";

import { useTranslations, useLocale } from "next-intl";
import React from "react";
import { useState } from "react";
import WeatherNavLinks from "@/app/[locale]/components/weekdaynav";
import Image from "next/image";
import WeatherMobileNavLinks from "@/app/[locale]/components/carousell";
import SunriseSunset from "@/app/[locale]/components/SunriseSunset";
import { DateTime } from "luxon";
import FooterMobile from "@/app/[locale]/components/FooterMobile";
import { WeatherData } from "@/types/weather";

interface ClientProps {
  formattedCity: string;
  fmiWeatherData: WeatherData[];
  ecmwfWeatherData: WeatherData[];
  sunrise: string | null;
  sunset: string | null;
  dayLengthFormatted: string | null;
}

// Function to determine temperature color
const getTempColor = (temp: number | null | undefined) => {
  if (temp === null || temp === undefined) return "text-blue-950"; // Default color for N/A
  return temp >= 0 ? "text-red-500" : "text-blue-500 dark:text-blue-700";
};

export default function Client({
  formattedCity,
  fmiWeatherData,
  ecmwfWeatherData,
  sunrise,
  sunset,
  dayLengthFormatted,
}: ClientProps) {
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const selectedWeatherData =
    selectedDay < 2 ? fmiWeatherData : ecmwfWeatherData;

  const filteredData = selectedWeatherData
    .filter(({ time }) => {
      const weatherDate = DateTime.fromISO(time)
        .setZone("Europe/Helsinki")
        .toISODate(); // Extract YYYY-MM-DD

      const today = DateTime.now().setZone("Europe/Helsinki");
      const selectedDate = today.plus({ days: selectedDay });
      const selectedDateString = selectedDate.toISODate(); // Get YYYY-MM-DD

      return weatherDate === selectedDateString; // Only keep exact matches
    })
    .filter((data, index) => {
      if (selectedDay === 0) return true; // Keep all hourly data for today

      if (selectedDay >= 2) return true; // Keep all data for ECMWF (future days)
      return index % 2 === 0; // Keep every 2nd entry (2-hour intervals) for other days
    })
    // New filter to remove entries with null/undefined temperature, windSpeed, or rainProp
    .filter((data) => {
      return (
        data.temperature !== null &&
        data.temperature !== undefined &&
        !isNaN(data.temperature) &&
        data.windSpeed !== null &&
        data.windSpeed !== undefined &&
        !isNaN(data.windSpeed) &&
        data.rainProp !== null &&
        data.rainProp !== undefined &&
        !isNaN(data.rainProp)
      );
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const t = useTranslations("weatherCity");
  const locale = useLocale();

  return (
    <>
      <div className="hidden lg:block">
        <WeatherNavLinks
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          fmiWeatherData={fmiWeatherData}
          ecmwfWeatherData={ecmwfWeatherData}
        />
      </div>
      <div className="lg:hidden">
        <WeatherMobileNavLinks
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          fmiWeatherData={fmiWeatherData}
          ecmwfWeatherData={ecmwfWeatherData}
        />
      </div>

      <div className="p-5 bg-blue-100 dark:bg-slate-950">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex bg-blue-800 p-6 border-b-2 border-blue-950 dark:border-slate-800 dark:bg-slate-700">
            <h2 className="text-xl font-bold text-gray-100">
              {t("weatherToday")} {formattedCity} -{" "}
              {selectedDay === 0
                ? t("today")
                : new Date(
                    new Date().setDate(new Date().getDate() + selectedDay)
                  ).toLocaleDateString(locale, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
            </h2>
          </div>
          <div className="w-full max-w-7xl mx-auto">
            {filteredData.length > 0 && (
              <div className="grid grid-cols-5 lg:grid-rows-5 lg:grid-cols-[120px_repeat(auto-fit,minmax(40px,1fr))] text-gray-100 font-semibold">
                <div className="bg-blue-800 p-3 flex items-center justify-center lg:row-start-1 dark:bg-slate-700">
                  {t("time")}
                </div>
                <div className=" bg-blue-800 p-3 items-center justify-center  hidden lg:flex lg:row-start-2 dark:bg-slate-700">
                  {t("temperature")}
                </div>
                <div className=" bg-blue-800 p-3 flex items-center justify-center  lg:hidden lg:row-start-2 dark:bg-slate-700">
                  {t("temp")}
                </div>
                <div className="bg-blue-800 p-3 flex items-center justify-center lg:row-start-3 dark:bg-slate-700">
                  {t("weather")}
                </div>
                <div className="bg-blue-800 p-3 flex items-center text-center justify-center lg:row-start-4 dark:bg-slate-700">
                  {t("wind")}
                </div>
                <div className="bg-blue-800 p-3 flex items-center text-center justify-center lg:row-start-5 dark:bg-slate-700">
                  {t("rain")}
                </div>

                {filteredData.map((data) => (
                  <React.Fragment key={data.time}>
                    <div className="bg-blue-400 p-3 flex items-center justify-center lg:row-start-1 text-gray-100 dark:bg-slate-500">
                      {DateTime.fromISO(data.time)
                        .setZone("Europe/Helsinki")
                        .toFormat("HH")}
                    </div>
                    <div
                      className={`bg-blue-200 p-3 text-center lg:row-start-2 flex items-center justify-center dark:bg-slate-400 ${getTempColor(
                        data.temperature
                      )}`}
                    >
                      {data.temperature ?? "N/A"}°
                    </div>
                    <div className="bg-blue-200 flex items-center justify-center py-3 px-1 lg:row-start-3 dark:bg-slate-500">
                      {data.smartData !== null && (
                        <Image
                          src={`/weathericons/${data.smartData}.svg`}
                          alt={`Weather icon ${data.smartData}`}
                          width={50}
                          height={50}
                          onError={(e) =>
                            (e.currentTarget.src = "/weathericons/default.svg")
                          }
                        />
                      )}
                    </div>
                    <div className="bg-blue-200 p-3 text-center text-blue-950 lg:row-start-4 flex  items-center justify-center dark:bg-slate-400 dark:text-gray-100">
                      {data.windSpeed ?? "N/A"}
                    </div>
                    <div className="bg-blue-200 p-3 text-center text-blue-950 lg:row-start-5 flex  items-center justify-center dark:bg-slate-500 dark:text-gray-100">
                      {data.rainProp ?? "N/A"}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-full max-w-7xl mx-auto p-5 flex gap-5 items-center justify-center flex-wrap border-b-2 border-blue-950 mt-5">
          <Image src="/Sunset.svg" width={50} height={50} alt="Sunset icon" />

          <SunriseSunset sunrise={sunrise} sunset={sunset} />
          <p className="font-bold text-lg text-blue-950 dark:text-gray-100">
            {t("daylength")} {dayLengthFormatted}
          </p>
        </div>
      </div>
      <div className="flex sm:hidden">
        <FooterMobile />
      </div>
    </>
  );
}
