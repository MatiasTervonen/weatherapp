"use client";

import { useTranslationContext } from "@/app/components/translationProvider";
import { useState, useEffect } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { DateTime } from "luxon";
import { WeatherData } from "@/types/weather";
import deriveSmartSymbol from "@/app/lib/smartSymbolECMWF";

interface WeatherNavLinksProps {
  selectedDay: number;
  onSelectDay: (dayIndex: number) => void;
  fmiWeatherData?: WeatherData[];
  ecmwfWeatherData?: WeatherData[];
}

const getTempColor = (temp: number | null | undefined) => {
  if (temp === null || temp === undefined) return "text-blue-950"; // Default color for N/A
  return temp >= 0 ? "text-red-500" : "text-blue-600";
};

export default function WeatherMobileNavLinks({
  selectedDay,
  onSelectDay,
  fmiWeatherData = [],
  ecmwfWeatherData = [],
}: WeatherNavLinksProps) {
  const [days, setDays] = useState<
    { label: string; dateKey: string; temp: number | null; icon?: string }[]
  >([]);

  const { locale } = useTranslationContext();

  useEffect(() => {
    if (!fmiWeatherData.length && !ecmwfWeatherData.length) return;

    //  Process ECMWF Data to Assign SmartSymbols Before Rendering
    const processedEcmwfData = ecmwfWeatherData.map((data) => ({
      ...data,
      smartData: deriveSmartSymbol(data),
    }));

    const today = DateTime.local().setZone("Europe/Helsinki");

    const formatDate = (offset: number) => {
      const date = today.plus({ days: offset });

      return {
        label: date.setLocale(locale).toLocaleString({
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
            .includes("15:00")
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
  }, [fmiWeatherData, ecmwfWeatherData, locale]);

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    initialSlide: 0,
    swipeToSlide: true,
    variableWidth: true,
  };

  return (
    <div className="bg-blue-600 p-2  text-gray-100 dark:bg-slate-950 dark:border-b-2 dark:border-slate-500 ">
      <Slider {...settings}>
        {days.map((day, index) => (
          <button
            key={index}
            className={`p-2 rounded-md flex flex-col justify-center items-center border-2 border-gray-100 ${
              selectedDay === index
                ? "bg-white text-blue-600 font-bold dark:bg-slate-700"
                : "bg-blue-400 hover:bg-blue-300 dark:hover:bg-slate-600 dark:bg-slate-800"
            }`}
            onClick={() => onSelectDay(index)}
          >
            <span>{day.label}</span>
            {/*  Display Weather Symbol for ALL Days (FMI & ECMWF) */}
            <div className="flex items-center justify-center py-2">
              {day.icon && (
                <Image
                  src={day.icon}
                  alt={`Weather icon for ${day.label}`}
                  width={50}
                  height={50}
                />
              )}
            </div>
            {/* Display Temperature */}
            <span className={`text-md font-bold ${getTempColor(day.temp)}`}>
              {day.temp !== null ? `${day.temp}°C` : "N/A"}
            </span>
          </button>
        ))}
      </Slider>
    </div>
  );
}
