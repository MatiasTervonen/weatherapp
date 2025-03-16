"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import deriveSmartSymbol from "./smartsymbolECMWF";
import { DateTime } from "luxon";

interface WeatherNavLinksProps {
  selectedDay: number;
  onSelectDay: (dayIndex: number) => void;
  fmiWeatherData?: {
    time: string;
    temperature?: number | null;
    smartData?: number | null;
  }[];
  ecmwfWeatherData?: {
    time: string;
    temperature?: number | null;
    windSpeed?: number | null;
    rainProp?: number | null;
    smartData?: number | null;
    pressure?: number | null;
    humidity?: number | null;
    location?: string;
  }[];
}

export default function WeatherNavLinks({
  selectedDay,
  onSelectDay,
  fmiWeatherData = [],
  ecmwfWeatherData = [],
}: WeatherNavLinksProps) {
  const [days, setDays] = useState<
    { label: string; dateKey: string; temp: number | null; icon?: string }[]
  >([]);

  useEffect(() => {
    if (!fmiWeatherData.length && !ecmwfWeatherData.length) return;

    // Process ECMWF Data to Assign SmartSymbols Before Rendering
    const processedEcmwfData = ecmwfWeatherData.map((data) => ({
      ...data,
      smartData: deriveSmartSymbol(
        data.temperature ?? null,
        data.windSpeed ?? 0,
        data.rainProp ?? null,
        data.pressure ?? null,
        data.humidity ?? null,
        data.time
      ),
    }));

    const today = DateTime.local().setZone("Europe/Helsinki");

    const formatDate = (offset: number) => {
      const date = today.plus({ days: offset });

      return {
        label: date.toLocaleString({
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        dateKey: date.toISODate() ?? "", // YYYY-MM-DD format
      };
    };

    // Generate 10 days dynamically
    const generatedDays = [...Array(10)].map((_, index) => {
      const { label, dateKey } = formatDate(index);

      const weatherForDay =
        index < 2
          ? fmiWeatherData.filter((w) =>
              DateTime.fromISO(w.time)
                ?.setZone("Europe/Helsinki")
                ?.toISODate()
                ?.startsWith(dateKey ?? "")
            ) // Use FMI for days 0-2
          : processedEcmwfData.filter((w) =>
              DateTime.fromISO(w.time)
                ?.setZone("Europe/Helsinki")
                ?.toISODate()
                ?.startsWith(dateKey ?? "")
            ); // Use ECMWF for days 3-9

      let selectedWeather = null;

      if (index === 0) {
        // For today, find the closest upcoming time
        const now = DateTime.local().setZone("Europe/Helsinki");
        selectedWeather = weatherForDay.find(
          (w) => DateTime.fromISO(w.time).setZone("Europe/Helsinki") >= now
        );
      } else {
        // For future days, select 14:00 forecast if available
        selectedWeather = weatherForDay.find((w) =>
          DateTime.fromISO(w.time)
            .setZone("Europe/Helsinki")
            .toFormat("HH:mm")
            .includes("14:00")
        );
      }

      // If no weather data is found for 14:00, select the first available data
      if (!selectedWeather && weatherForDay.length > 0) {
        selectedWeather = weatherForDay[0];
      }

      return {
        label,
        dateKey,
        temp: selectedWeather?.temperature ?? null,
        icon: selectedWeather?.smartData
          ? `/weathericons/${selectedWeather.smartData}.svg`
          : undefined, // ✅ ECMWF now gets SmartSymbols!
      };
    });

    setDays(generatedDays);
  }, [fmiWeatherData, ecmwfWeatherData]);

  const getTempColor = (temp: number | null | undefined) => {
    if (temp === null || temp === undefined) return "text-blue-950"; // Default color for N/A
    return temp >= 0 ? "text-red-500" : "text-blue-600";
  };

  return (
    <div className="bg-blue-600 text-gray-100 px-2 py-6 flex justify-center items-center border-b-4 dark:border-b-slate-500 gap-2 dark:dark:bg-slate-950">
      {days.map((day, index) => (
        <button
          key={index}
          className={`px-4 py-2 rounded-md flex flex-col justify-center items-center ${
            selectedDay === index
              ? "bg-white text-blue-600 font-bold dark:bg-slate-700"
              : "bg-blue-400 hover:bg-blue-300 dark:hover:bg-slate-600 dark:bg-slate-800"
          }`}
          onClick={() => onSelectDay(index)}
        >
          <span>{day.label}</span>
          {/* Display Weather Symbol for ALL Days (FMI & ECMWF) */}
          {day.icon && (
            <Image
              src={day.icon}
              alt={`Weather icon for ${day.label}`}
              width={50}
              height={50}
              className=""
            />
          )}
          {/* Display Temperature */}
          <span className={`text-md font-bold ${getTempColor(day.temp)}`}>
            {day.temp !== null ? `${day.temp}°C` : "N/A"}
          </span>
        </button>
      ))}
    </div>
  );
}
