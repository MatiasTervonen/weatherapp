import { supabaseClient } from "@/utils/supabase/supabaseClient";

export async function getWeatherDayAfterTomorrow() {
  const { data, error } = await supabaseClient
    .from("weather_dayAfterTomorrow")
    .select("time, temperature, smartData, location");

  if (error) {
    throw new Error("Error fetching weather data:");
  }

  return data;
}
