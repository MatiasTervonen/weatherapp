import { NextResponse } from "next/server"; // handels the Api call
import { fetchRealTimeWeatherData } from "@/app/lib/weatherRealTime";


export async function GET() {
  try {
    const weatherData = await fetchRealTimeWeatherData();

    return NextResponse.json({
      message: "Weather data fetched successfully!",
      data: weatherData,
    });
    return NextResponse.json({ message: "Weather data cached to Supabase!" });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to process FMI weather data" },
      { status: 500 }
    );
  }
}
