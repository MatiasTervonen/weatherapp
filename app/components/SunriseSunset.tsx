import React from "react";

interface SunriseSunsetProps {
  sunrise: string | null;
  sunset: string | null;
}

export default function SunriseSunset({ sunrise, sunset }: SunriseSunsetProps) {
  return (
    <div className="flex flex-row flex-wrap justify-center items-center gap-5">
      <span className="text-lg font-bold text-blue-950 dark:text-gray-100">
        Sunrise: {sunrise}
      </span>
      <span className="text-lg font-bold  text-blue-950 dark:text-gray-100">
        Sunset: {sunset}
      </span>
    </div>
  );
}
