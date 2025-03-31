"use client";

export default function Error({ error }: { error: Error }) {
  console.log("Error in WeatherMap:", error);

  return (
    <div className="text-center text.red-500 ">
      Error loading weather data. Please try again later.
    </div>
  );
}
