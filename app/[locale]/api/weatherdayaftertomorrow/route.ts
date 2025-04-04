import { NextResponse } from "next/server"; // Handles the API call
import { fetchDayAfterTomorrowWeatherData } from "@/app/lib/weatherDayAfterTomorrow";

export async function GET() {
  try {
    const weatherData = await fetchDayAfterTomorrowWeatherData();

    // Directly return the weather data without filtering
    return NextResponse.json(weatherData, {
      headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate" },
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to process FMI weather data" },
      { status: 500 }
    );
  }
}
