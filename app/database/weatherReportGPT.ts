"use server";

import { supabaseClient } from "@/utils/supabase/supabaseClient";

export async function getWeatherReportGPT() {
  const { data, error } = await supabaseClient
    .from("weather_reportgpt")
    .select("report, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error("Error fetching weather data");
  }

  return data?.[0] ?? {};
}
