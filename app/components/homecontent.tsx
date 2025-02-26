"use client";

import { useState } from "react";
import WeatherMap from "./weathermap";
import WeatherMapTomorrow from "./weathermaptomorrow";
import WeatherMapDayAfterTomorrow from "./weathermapdayaftertomorrow";
import DateTimeDisplay from "./datetime";

export default function HomeContent() {
  const [activeMap, setActiveMap] = useState("today");

  return (
    <div className="flex justify-center mt-10 md:mt-20">
      <div className="flex flex-col md:flex-row bg-blue-200 rounded-xl">
        <div>
          <div className="p-5 text-xl">
            <DateTimeDisplay />
          </div>
          <div className="flex justify-center  md:flex-col">
            <div className="p-2 text-xl font-bold sm:p-5">
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
            <div className="p-2 text-xl font-bold sm:p-5">
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
            <div className="p-2 text-xl font-bold sm:p-5">
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
  );
}
