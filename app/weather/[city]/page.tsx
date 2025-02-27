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
      const weatherTime = new Date(time).getTime();
      const now = new Date();
      const utcNow = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          now.getUTCSeconds()
        )
      );

      const selectedDate = new Date(
        Date.UTC(
          utcNow.getUTCFullYear(),
          utcNow.getUTCMonth(),
          utcNow.getUTCDate() + selectedDay,
          0,
          0,
          0,
          0
        )
      );

      const nextDate = new Date(selectedDate);
      nextDate.setUTCHours(23, 59, 59, 999);

      return (
        weatherTime >= selectedDate.getTime() &&
        weatherTime < nextDate.getTime()
      );
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  console.log("Rendered Data:", filteredData);

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
            <div className="bg-blue-200 w-full max-w-6xl mx-auto">
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
              <div className="w-full max-w-6xl mx-auto">
                {filteredData.length > 0 && (
                  <div className="grid grid-cols-5 lg:grid-cols-[repeat(13,1fr)] lg:grid-rows-5 text-white font-semibold">
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
                            .toISOString()
                            .split("T")[1]
                            .slice(0, 5)}
                        </div>
                        <div className="bg-blue-200 p-3 text-center text-blue-950 lg:row-start-2 flex items-center justify-center">
                          {data.temperature ?? "N/A"}°C
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
