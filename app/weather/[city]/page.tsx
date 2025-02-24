"use client";

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

  const filteredData = selectedWeatherData.filter((weather) => {
    const weatherDate = new Date(weather.time).toISOString().split("T")[0]; // YYYY-MM-DD
    const selectedFullDate = new Date(
      new Date().setDate(new Date().getDate() + selectedDay)
    )
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD

    return weatherDate === selectedFullDate;
  });

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
          <div className="p-10 bg-blue-100 rounded-md">
            <div className="flex justify-center">
              <h2 className="text-xl font-bold">
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
            <div className="flex flex-row gap-2 justify-center items-center mt-4">
              {filteredData.map((data, index) => {
                const smartIcon =
                  data.smartData !== null
                    ? `/weathericons/${data.smartData}.svg`
                    : "";

                return (
                  <div
                    key={index}
                    className="p-4 border rounded-md shadow-md bg-white"
                  >
                    <p>
                      🗓️ Time:{" "}
                      {new Date(data.time).toLocaleTimeString([], {
                        hour: "numeric",
                      })}
                    </p>
                    <p>🌡️ Temperature: {data.temperature ?? "N/A"}°C</p>
                    <p>💨 Wind Speed: {data.windSpeed ?? "N/A"} m/s</p>
                    <p>🌧️ Rain/mm: {data.rainProp ?? "N/A"}</p>
                    {smartIcon && (
                      <Image
                        src={smartIcon}
                        alt={`Weather icon ${data.smartData}`}
                        width={50}
                        height={50}
                        className="mb-2"
                        onError={(e) =>
                          (e.currentTarget.src = "/weathericons/default.svg")
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
