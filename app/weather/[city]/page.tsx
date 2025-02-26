"use client";

import React from "react";
import { useEffect, useState } from "react";
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
  const params = useParams();
  const city: string = (params.city as string) ?? "Unknown";

  const [fmiWeatherData, setFmiWeatherData] = useState<WeatherData[]>([]);
  const [ecmwfWeatherData, setEcmwfWeatherData] = useState<WeatherData[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      if (!city || city === "Unknown") return;

      try {
        setLoading(true);
        setError(null);

        // Fetch FMI (short-term) data
        const fmiRes = await fetch(
          `/api/weathercities?city=${encodeURIComponent(city)}`
        );
        if (!fmiRes.ok) throw new Error("Failed to fetch FMI weather data");
        const fmiData = await fmiRes.json();

        setFmiWeatherData(fmiData);

        // Fetch ECMWF (long-term) data
        const ecmwfRes = await fetch(
          `/api/weatherforecast?city=${encodeURIComponent(city)}`
        );
        if (!ecmwfRes.ok) throw new Error("Failed to fetch ECMWF weather data");
        const ecmwfData = await ecmwfRes.json();

        const processedEcmwfData = ecmwfData.map((data: WeatherData) => ({
          ...data,
          smartData: deriveSmartSymbol(
            data.temperature ?? null,
            data.windSpeed ?? 0,
            data.rainProp ?? null,
            data.pressure ?? null,
            data.humidity ?? null,
            data.time // Pass the timestamp to determine day/night
          ),
        }));

        setEcmwfWeatherData(processedEcmwfData);
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

  // 🔹 Select correct dataset based on `selectedDay`
  const selectedWeatherData =
    selectedDay < 3 ? fmiWeatherData : ecmwfWeatherData;

  const filteredData = selectedWeatherData
    .filter((weather) => {
      const weatherTime = new Date(weather.time);
      const selectedDate = new Date();
      selectedDate.setDate(selectedDate.getDate() + selectedDay);
      selectedDate.setHours(0, 0, 0, 0); // Start of the selected day

      const nextDate = new Date(selectedDate);
      nextDate.setHours(23, 59, 59, 999); // ✅ Should include up to 23:59:59

      return weatherTime >= selectedDate && weatherTime <= nextDate;
    })
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());


  // Append tomorrows data also to first day if its not take full slots

  if (selectedDay === 0) {
    const missingSlots = 12 - filteredData.length; // Ensure there are always 12 slots
    console.log("Missing Slots:", missingSlots);

    if (missingSlots > 0) {
      const nextDayData = selectedWeatherData
        .filter((weather) => {
          const weatherTime = new Date(weather.time);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1); // Move to next day
          tomorrow.setHours(0, 0, 0, 0);

          const tomorrowEnd = new Date(tomorrow);
          tomorrowEnd.setHours(23, 59, 59, 999);

          return weatherTime >= tomorrow && weatherTime <= tomorrowEnd;
        })
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        .slice(0, missingSlots); // Append only the required slots

      filteredData.push(...nextDayData); // Append extra slots from the next day
    }
  }

  // Ensure data remains sorted
  filteredData.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );


  return (
    <>
      {loading ? (
        <PageSkeleton /> // ✅ Show full-page skeleton while loading
      ) : error ? (
        <p>Error loading data...</p>
      ) : (
        <>
          <div>
            <WeatherNavLinks
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              fmiWeatherData={fmiWeatherData}
              ecmwfWeatherData={ecmwfWeatherData}
            />
          </div>
          <div className="p-10 bg-blue-100">
            <div className="bg-blue-200 w-full max-w-6xl mx-auto">
              <div className="flex bg-blue-800 p-6 border-b- border-blue-950">
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
              {/* ✅ Weather Data Grid */}
              <div className="w-full max-w-6xl mx-auto">
                {filteredData.length > 0 && (
                  <div className="grid grid-rows-5 auto-cols-auto text-white items-center  font-semibold">
                    {/* ✅ Header Row - Always Aligned with Data */}

                    <div className="bg-blue-800 h-full p-3 flex items-center justify-center row-start-1">
                      <p>Time</p>
                    </div>
                    <div className="bg-blue-800 h-full p-3 flex items-center justify-center row-start-2">
                      <p>Temperature</p>
                    </div>
                    <div className="bg-blue-800 h-full p-3 flex items-center justify-center row-start-3">
                      <p>Weather</p>
                    </div>
                    <div className="bg-blue-800 h-full p-3 flex items-center justify-center row-start-4">
                      <p>Wind</p>
                    </div>
                    <div className="bg-blue-800 h-full p-3 flex items-center justify-center row-start-5">
                      <p>Rain</p>
                    </div>

                    {/* ✅ Weather Data Row (Properly Aligned with Header) */}
                    {filteredData.map((data) => {
                      const smartIcon =
                        data.smartData !== null
                          ? `/weathericons/${data.smartData}.svg`
                          : "";

                      return (
                        <React.Fragment key={data.time}>
                          <div
                            key={data.time}
                            className="bg-blue-400 p-3 flex items-center justify-center h-full row-start-1"
                          >
                            {new Date(data.time).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hourCycle: "h23", // Forces 24-hour format
                            })}
                          </div>
                          <div className="bg-blue-200 p-3 text-center row-start-2 text-blue-950">
                            {data.temperature ?? "N/A"}°C
                          </div>
                          <div className="bg-blue-200 flex items-center justify-center  p-3  row-start-3">
                            {smartIcon && (
                              <Image
                                src={smartIcon}
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
                          <div className="bg-blue-200 p-3 text-center row-start-4 text-blue-950">
                            {data.windSpeed ?? "N/A"} m/s
                          </div>
                          <div className="bg-blue-200 p-3 text-center text-blue-950">
                            {data.rainProp ?? "N/A"} mm
                          </div>
                        </React.Fragment>
                      );
                    })}
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
