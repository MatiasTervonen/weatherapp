import { NextResponse } from "next/server"; // Handles the API call
import { fetchDayAfterTomorrowWeatherData } from "@/app/lib/weatherDayAfterTomorrow";


export async function GET() {
  try {
    const weatherData = await fetchDayAfterTomorrowWeatherData();

    return NextResponse.json({
      message: "Weather data fetched successfully!",
      data: weatherData,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to process FMI weather data" },
      { status: 500 }
    );
  }
}
