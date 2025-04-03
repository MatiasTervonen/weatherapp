import { NextResponse } from "next/server"; // handels the Api call
import { fetchRealTimeWeatherData } from "@/app/[locale]/lib/weatherRealTime";

export async function GET() {
  try {
    const weatherData = await fetchRealTimeWeatherData();

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
