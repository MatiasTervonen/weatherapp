"use client";

import { useState } from "react";
import { rubik } from "@/app/ui/fonts";
import Image from "next/image";
// import LatestWeatherData from "./components/latestweatherdata";
import WeatherMap from "./components/weathermap";
import DateTimeDisplay from "./components/datetime";
import WeatherMapTomorrow from "./components/weathermaptomorrow";
import WeatherMapDayAfterTomorrow from "./components/weathermapdayaftertomorrow";

export default function Home() {
  const [activeMap, setActiveMap] = useState("today");

  return (
    <div>
      {/* Header */}

      <div className="bg-blue-900 flex justify-center">
        <h1
          className={`${rubik.className} text-5xl font-semibold text-white py-10`}
        >
          The Weather Channel
        </h1>
      </div>

      {/* Navbar */}
      <div
        className={`${rubik.className}  flex justify-center items-center gap-5 text-white text-3xl font-semibold p-3 bg-blue-400`}
      >
        <a href="">Today</a>
        <a href="">Hourly</a>
        <a href="">10 Days</a>
        <div className="relative flex items-center">
          <input
            className="text-lg  z-10 text-black p-2 pl-10 rounded-full"
            type="text"
            placeholder="Search location..."
          />
          <button className="absolute z-0 -right-12  pl-14 pr-2 py-2 rounded-full bg-blue-800 hover:scale-95 hover:bg-blue-700">
            <Image src="/Search.png" width={40} height={40} alt="finland map" />
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <div className="flex bg-blue-200 rounded-xl">
          <div>
            <div className="p-5 text-xl">
              <DateTimeDisplay />
            </div>
            <div className="p-5 text-xl font-bold">
              <button
                onClick={() => setActiveMap("today")}
                className={`p-2 ${
                  activeMap === "today"
                    ? "text-blue-700 underline"
                    : "text-gray-600"
                }`}
              >
                Weather Now
              </button>
            </div>
            <div className="p-5 text-xl font-bold">
              <button
                onClick={() => setActiveMap("tomorrow")}
                className={`p-2 ${
                  activeMap === "tomorrow"
                    ? "text-blue-700 underline"
                    : "text-gray-600"
                }`}
              >
                Tomorrow
              </button>
            </div>
            <div className="p-5 text-xl font-bold">
              <button
                onClick={() => setActiveMap("dayaftertomorrow")}
                className={`p-2 ${
                  activeMap === "dayaftertomorrow"
                    ? "text-blue-700 underline"
                    : "text-gray-600"
                }`}
              >
                Day after tomorrow
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            {activeMap === "today" ? (
              <WeatherMap />
            ) : activeMap === "tomorrow" ? (
              <WeatherMapTomorrow />
            ) : (
              <WeatherMapDayAfterTomorrow />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
