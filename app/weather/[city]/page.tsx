"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WeatherNavLinks from "app/components/weekdaynav";
import Image from "next/image";
import deriveSmartSymbol from "@/app/components/smartsymbolECMWF";
import { PageSkeleton } from "@/app/ui/skeleton";

interface WeatherData {
  time: string;
  temperature?: number | null;
  windSpeed?: number | null;
  rainProp?: number | null;
  smartData?: number | null;
  pressure: number | null;
  humidity: number | null;
  location?: string;
}

export default function FeatherForCity() {
  const { city = "Unknown" } = useParams() as { city: string };

  const [fmiWeatherData, setFmiWeatherData] = useState<WeatherData[]>([]);
  const [ecmwfWeatherData, setEcmwfWeatherData] = useState<WeatherData[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city || city === "Unknown") return;

    async function fetchWeather() {
      setLoading(true);
      setError(null);

      try {
        const [fmiRes, ecmwfRes] = await Promise.all([
          fetch(`/api/weathercities?city=${encodeURIComponent(city)}`),
          fetch(`/api/weatherforecast?city=${encodeURIComponent(city)}`),
        ]);

        if (!fmiRes.ok || !ecmwfRes.ok)
          throw new Error("Failed to fetch weather data");

        const [fmiData, ecmwfData] = await Promise.all([
          fmiRes.json(),
          ecmwfRes.json(),
        ]);

        setFmiWeatherData(fmiData);
        setEcmwfWeatherData(
          ecmwfData.map((data: WeatherData) => ({
            ...data,
            smartData: deriveSmartSymbol(
              data.temperature ?? null,
              data.windSpeed ?? 0,
              data.rainProp ?? null,
              data.pressure ?? null,
              data.humidity ?? null,
              data.time
            ),
          }))
        );
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city]);

  const selectedWeatherData =
    selectedDay < 3 ? fmiWeatherData : ecmwfWeatherData;

  const filteredData = selectedWeatherData
    .filter(({ time }) => {
      const weatherTime = new Date(time).getTime(); // UTC timestamp from API
      const now = new Date(); // Current UTC time (no local time adjustments)

      // Set baseDate to midnight of the current UTC date
      const baseDateUTC = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );

      // Calculate the target date based on selectedDay in UTC
      const selectedDateUTC = new Date(baseDateUTC);
      selectedDateUTC.setUTCDate(baseDateUTC.getUTCDate() + selectedDay);

      const nextDateUTC = new Date(selectedDateUTC);
      nextDateUTC.setUTCDate(selectedDateUTC.getUTCDate() + 1);

      return (
        weatherTime >= selectedDateUTC.getTime() &&
        weatherTime < nextDateUTC.getTime()
      );
    })
    .filter((data, index) => {
      if (selectedDay === 0) return true; // Keep all hourly data for today

      if (selectedDay >= 3) return true; // Keep all data for ECMWF (future days)
      return index % 2 === 0; // Keep every 2nd entry (2-hour intervals) for other days
    })
    // New filter to remove entries with null/undefined temperature, windSpeed, or rainProp
    .filter((data) => {
      return (
        data.temperature !== null &&
        data.temperature !== undefined &&
        data.windSpeed !== null &&
        data.windSpeed !== undefined &&
        data.rainProp !== null &&
        data.rainProp !== undefined
      );
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  console.log("Rendered Data:", filteredData);

  // Function to determine temperature color
  const getTempColor = (temp: number | null | undefined) => {
    if (temp === null || temp === undefined) return "text-blue-950"; // Default color for N/A
    return temp >= 0 ? "text-red-500" : "text-blue-500";
  };

  return (
    <>
      {loading ? (
        <PageSkeleton />
      ) : error ? (
        <p>Error loading data...</p>
      ) : (
        <>
          <WeatherNavLinks
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            fmiWeatherData={fmiWeatherData}
            ecmwfWeatherData={ecmwfWeatherData}
          />
          <div className="p-10 bg-blue-100">
            <div className="bg-blue-200 w-full max-w-7xl mx-auto">
              <div className="flex bg-blue-800 p-6 border-b border-blue-950">
                <h2 className="text-xl font-bold text-white">
                  Weather in {city} -{" "}
                  {selectedDay === 0
                    ? "Today"
                    : new Date(
                        new Date().setDate(new Date().getDate() + selectedDay)
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                </h2>
              </div>
              <div className="w-full max-w-7xl mx-auto">
                {filteredData.length > 0 && (
                  <div className="grid grid-cols-5 lg:grid-rows-5 lg:grid-cols-[120px_repeat(auto-fit,minmax(40px,1fr))] text-white font-semibold">
                    <div className="bg-blue-800 p-3 flex items-center justify-center lg:row-start-1">
                      Time
                    </div>
                    <div className=" bg-blue-800 p-3 items-center justify-center  hidden lg:flex lg:row-start-2">
                      Temperature
                    </div>
                    <div className=" bg-blue-800 p-3 flex items-center justify-center  lg:hidden lg:row-start-2">
                      Temp
                    </div>
                    <div className="bg-blue-800 p-3 flex items-center justify-center lg:row-start-3">
                      Weather
                    </div>
                    <div className="bg-blue-800 p-3 flex items-center justify-center lg:row-start-4">
                      Wind
                    </div>
                    <div className="bg-blue-800 p-3 flex items-center justify-center lg:row-start-5">
                      Rain
                    </div>

                    {filteredData.map((data) => (
                      <React.Fragment key={data.time}>
                        <div className="bg-blue-400 p-3 flex items-center justify-center lg:row-start-1">
                          {new Date(data.time)
                            .getUTCHours()
                            .toString()
                            .padStart(2, "0")}
                        </div>
                        <div
                          className={`bg-blue-200 p-3 text-center lg:row-start-2 flex items-center justify-center ${getTempColor(
                            data.temperature
                          )}`}
                        >
                          {data.temperature ?? "N/A"}°
                        </div>
                        <div className="bg-blue-200 flex items-center justify-center p-3 lg:row-start-3">
                          {data.smartData !== null && (
                            <Image
                              src={`/weathericons/${data.smartData}.svg`}
                              alt={`Weather icon ${data.smartData}`}
                              width={50}
                              height={50}
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "/weathericons/default.svg")
                              }
                            />
                          )}
                        </div>
                        <div className="bg-blue-200 p-3 text-center text-blue-950 lg:row-start-4 flex items-center justify-center">
                          {data.windSpeed ?? "N/A"} m/s
                        </div>
                        <div className="bg-blue-200 p-3 text-center text-blue-950 lg:row-start-5 flex items-center justify-center">
                          {data.rainProp ?? "N/A"} mm
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
