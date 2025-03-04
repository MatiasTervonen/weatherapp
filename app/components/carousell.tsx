"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import deriveSmartSymbol from "./smartsymbolECMWF";

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

export default function WeatherMobileNavLinks({
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

    //  Process ECMWF Data to Assign SmartSymbols Before Rendering
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

    const today = new Date();

    const formatDate = (offset: number) => {
      const date = new Date();
      date.setDate(today.getDate() + offset);

      return {
        label: date.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        dateKey: date.toISOString().split("T")[0], // YYYY-MM-DD format
      };
    };

    // Generate 10 days dynamically
    const generatedDays = [...Array(10)].map((_, index) => {
      const { label, dateKey } = formatDate(index);

      const weatherForDay =
        index < 3
          ? fmiWeatherData.filter((w) => w.time.startsWith(dateKey)) // Use FMI for days 0-2
          : processedEcmwfData.filter((w) => w.time.startsWith(dateKey)); // Use ECMWF for days 3-9

      let selectedWeather = null;

      if (index === 0) {
        //  For today, find the closest upcoming time
        const now = new Date();
        selectedWeather = weatherForDay.find((w) => new Date(w.time) >= now);
      } else {
        //  For future days, select 14:00 forecast if available
        selectedWeather = weatherForDay.find((w) => w.time.includes("14:00"));
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

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 6,
        },
      },
    ],
  };

  const getTempColor = (temp: number | null | undefined) => {
    if (temp === null || temp === undefined) return "text-blue-950"; // Default color for N/A
    return temp >= 0 ? "text-red-500" : "text-blue-600";
  };

  return (
    <div className="bg-blue-600 p-2  text-white">
      <Slider {...settings}>
        {days.map((day, index) => (
          <button
            key={index}
            className={`p-2 rounded-md flex flex-col justify-center items-center ${
              selectedDay === index
                ? "bg-white text-blue-600 font-bold"
                : "bg-blue-400 hover:bg-blue-300"
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
                  className=""
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
