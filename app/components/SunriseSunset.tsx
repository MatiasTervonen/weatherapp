import React from "react";

interface SunriseSunsetProps {
  sunrise: string | null;
  sunset: string | null;
}

export default function SunriseSunset({ sunrise, sunset }: SunriseSunsetProps) {
  return (
    <div className="flex flex-row items-center gap-5">
      <span className="text-lg font-bold text-blue-950">
        Sunrise: {sunrise}
      </span>
      <span className="text-lg font-bold  text-blue-950">Sunset: {sunset}</span>
    </div>
  );
}
