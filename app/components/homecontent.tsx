"use client";

import { useState, useMemo } from "react";
import WeatherMap from "./weathermap";
import WeatherMapTomorrow from "./weathermaptomorrow";
import WeatherMapDayAfterTomorrow from "./weathermapdayaftertomorrow";
import DateTimeDisplay from "./datetime";
import Maplibre from "./maplibre";
import FooterMobile from "./FooterMobile";

export default function HomeContent() {
  const [activeMap, setActiveMap] = useState("today");

  // UseMemo to keep the layout stable
  const renderMap = useMemo(() => {
    switch (activeMap) {
      case "tomorrow":
        return <WeatherMapTomorrow />;
      case "dayaftertomorrow":
        return <WeatherMapDayAfterTomorrow />;
      case "radarData":
        return "";
      default:
        return <WeatherMap />;
    }
  }, [activeMap]);

  return (
    <>
      <div className=" flex flex-col-reverse gap-5 justify-center md:mt-20 md:flex-row">
        <div className="bg-blue-200 flex flex-col md:mr-5 md:rounded-xl md:pr-20 justify-between border-y-2 md:border-2 border-gray-100 dark:bg-slate-950 dark:text-white">
          <div>
            <div className="p-5 text-xl text-gray-600 h-[68px] hidden md:block dark:text-gray-100">
              <DateTimeDisplay />
            </div>
            <div className="flex flex-wrap justify-center  md:flex-col ">
              <div className="p-5 text-xl font-bold text-nowrap ">
                <button
                  onClick={() => setActiveMap("today")}
                  className={`p-2 ${
                    activeMap === "today"
                      ? "text-blue-700 underline"
                      : "text-gray-600 dark:text-gray-100"
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
                      : "text-gray-600 dark:text-gray-100"
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
                      : "text-gray-600 dark:text-gray-100"
                  }`}
                >
                  Day after tomorrow
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 text-gray-600 text-center dark:text-gray-100">
            Data Finnish Meteorological Institute
          </div>
        </div>

        {/* ✅ FIX: Set fixed height for the weather map container */}
        <div className="flex justify-center md:pt-0 mt-2 md:mt-0">
          <div className=" md:bg-blue-300 rounded-xl p-10 pt-5 md:border-2 md:border-gray-100 md:p-20 md:dark:bg-slate-950">
            {renderMap}
          </div>
        </div>
      </div>
      <div className="flex justify-center my-10 md:my-20">
        <Maplibre />
      </div>
      <div className=" flex sm:hidden">
        <FooterMobile />
      </div>

      {/* <div className="flex justify-center">
        <div>
          <WarningsPage />
        </div>
      </div> */}
    </>
  );
}
