"use server";

import { supabaseClient } from "@/utils/supabase/supabaseClient";

export async function getWeatherTomorrow() {
  const { data, error } = await supabaseClient
    .from("weather_tomorrow")
    .select("time, temperature, smartData, location");

  if (error) {
    throw new Error("Error fetching weather data:");
  }

  return data;
}
