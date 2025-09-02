import { NextResponse, NextRequest } from "next/server"; // Handles the API call
import { updateWeatherData } from "@/app/lib/weatherDayAfterTomorrow";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const weatherData = await updateWeatherData();

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
