import { NextResponse } from "next/server"; // Handles the API call
import { fetchTomorrowWeatherData } from "@/app/lib/weatherTomorrow";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET() {
  try {
    const weatherData = await fetchTomorrowWeatherData();

    const { error } = await supabaseAdmin
      .from("weatherTomorrow")
      .upsert([{ id: 1, data: weatherData, updated_at: new Date() }]);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: "Weather data cached to Supabase" });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to process FMI weather data" },
      { status: 500 }
    );
  }
}
