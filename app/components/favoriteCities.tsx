"use client";

import { fetchWeatherForCityFMI } from "../database/weatherForecastFMI";
import { useState, useEffect } from "react";
import { WeatherData } from "@/types/weather";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFavoriteCitiesStore } from "@/app/lib/favoriteCitiesStore";

export default function FavoriteCities() {
  const [weather, setWeather] = useState<WeatherData[]>([]); // Weather data
  const router = useRouter(); // Router for navigation

  const favoriteCities = useFavoriteCitiesStore(
    (state) => state.favoriteCities
  );

  const setFavoriteCities = useFavoriteCitiesStore(
    (state) => state.setFavoriteCities
  ); // Function to set favorite cities in Zustand store

  useEffect(() => {
    const fromStorage = localStorage.getItem("favoriteCities");
    if (fromStorage) {
      setFavoriteCities(JSON.parse(fromStorage)); // Load favorite cities from local storage
    }
  }, [setFavoriteCities]);

  useEffect(() => {
    const fetchWeather = async () => {
      const allWeather: WeatherData[] = []; // Initialize an empty array to store all weather data

      for (const city of favoriteCities) {
        const weatherData = await fetchWeatherForCityFMI(city); // Fetch weather data for each city
        if (weatherData.length > 0) {
          allWeather.push(weatherData[0]); // Push the first element of the fetched data to the array
        }
      }

      setWeather(allWeather); // Set the weather state with the fetched data
    };

    if (favoriteCities.length > 0) {
      fetchWeather();
    } else {
      setWeather([]); // If no favorite cities, set weather to an empty array
    }
  }, [favoriteCities]);

  const cityClick = (city: string) => {
    router.push(`/weather/${encodeURIComponent(city)}`); // Navigate to the weather page for the clicked city
  };

  return (
    <div className="flex  items-center justify-center flex-wrap bg-blue-400 dark:bg-slate-950 lg:flex-row">
      {weather.map((cityData) => {
        const time = new Date(cityData.time);
        const formattedTime = time.toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={cityData.location}
            onClick={() => cityClick(cityData.location!)} // Handle city click
            className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="flex items-center justify-center p-2 gap-5 flex-wrap">
              <div
                key={cityData.location}
                className=" p-2 text-center bg-blue-900 dark:bg-slate-800 rounded-md"
              >
                {cityData.location} - {formattedTime}
              </div>
              <div className="flex items-center justify-center gap-4">
                {cityData.smartData !== null &&
                  cityData.smartData !== undefined &&
                  !Number.isNaN(cityData.smartData) && (
                    <Image
                      src={`/weathericons/${cityData.smartData}.svg`}
                      alt={`Weather icon ${cityData.smartData}`}
                      width={40}
                      height={40}
                    />
                  )}
                <div className="font-bold dark:font-normal text-gray-800 dark:text-gray-100">
                  {cityData.temperature}°C
                </div>
                <div className="flex items-center gap-2 font-bold text-gray-800 dark:font-normal dark:text-gray-100">
                  <Image src="/Wind.png" alt="Wind" width={20} height={20} />
                  {cityData.windSpeed} m/s
                </div>
                <div className="flex items-center gap-2 font-bold text-gray-800 dark:font-normal dark:text-gray-100">
                  <Image src="/Water.png" alt="Rain" width={20} height={20} />
                  {cityData.rainProp} mm
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
