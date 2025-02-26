"use client";

import { useState, useMemo } from "react";
import WeatherMap from "./weathermap";
import WeatherMapTomorrow from "./weathermaptomorrow";
import WeatherMapDayAfterTomorrow from "./weathermapdayaftertomorrow";
import DateTimeDisplay from "./datetime";

export default function HomeContent() {
  const [activeMap, setActiveMap] = useState("today");

  // UseMemo to keep the layout stable
  const renderMap = useMemo(() => {
    switch (activeMap) {
      case "tomorrow":
        return <WeatherMapTomorrow />;
      case "dayaftertomorrow":
        return <WeatherMapDayAfterTomorrow />;
      default:
        return <WeatherMap />;
    }
  }, [activeMap]);

  return (
    <>
      <div className=" flex flex-col-reverse  justify-center md:mt-20 md:flex-row">
        <div className="bg-blue-200  md:mr-5 md:rounded-xl md:pr-20">
          <div className="p-5 text-xl text-gray-600 hidden md:block">
            <DateTimeDisplay />
          </div>
          <div className="flex flex-wrap justify-center  md:flex-col">
            <div className="p-5 text-xl font-bold text-nowrap ">
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
            <div className="p-5 text-xl font-bold text-nowrap">
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
            <div className="p-5 text-xl font-bold text-nowrap">
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

        {/* ✅ FIX: Set fixed height for the weather map container */}
        <div className="flex justify-center  md:pt-0">
          <div className=" md:bg-blue-300 rounded-xl p-10 pt-5 md:p-20">
            {renderMap}
          </div>
        </div>
      </div>
    </>
  );
}
