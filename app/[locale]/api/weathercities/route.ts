import { NextResponse } from "next/server"; // handels the Api call
import { WeatherData } from "@/types/weather";
import { fetchWeatherForCityFMI } from "@/app/lib/weatherForecastFMI"; // Import the list of cities

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

    const weatherData = await fetchWeatherForCityFMI(city);

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
