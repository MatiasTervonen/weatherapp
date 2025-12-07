import { supabaseClient } from "@/utils/supabase/supabaseClient";

export async function getWeatherSummary() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabaseClient
    .from("weather_summary")
    .select("summary")
    .eq("date", today)
    .single();

  if (error) {
    throw new Error("Error fetching weather data");
  }

  return data;
}
