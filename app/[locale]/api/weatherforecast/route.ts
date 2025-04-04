import { NextResponse } from "next/server";
import { fetchWeatherForCityECMWF } from "../../lib/weatherForecastECMWF";
import { WeatherData } from "@/types/weather"; // Import the WeatherData type

export async function GET(
  req: Request
): Promise<NextResponse<WeatherData[] | { error: string }>> {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    if (!city) {
      return NextResponse.json(
        { error: "City parameter is required" },
        { status: 400 }
      );
    }

    const weatherData = await fetchWeatherForCityECMWF(city);

    if (weatherData.length === 0) {
      return NextResponse.json(
        { error: "No weather data available for this city" },
        { status: 404 }
      );
    }

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
