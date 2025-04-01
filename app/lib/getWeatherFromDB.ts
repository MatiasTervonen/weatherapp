import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function getWeatherFromDB() {
  const { data, error } = await supabaseAdmin
    .from("weather_reportgpt")
    .select("report, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching weather summary:", error);
    throw new Error("Failed to fetch weather summary");
  }
  if (!data || data.length === 0) {
    console.warn("No weather data found");
  }

  return {
    report: data?.[0]?.report || null,
    created_at: data?.[0]?.created_at || null,
  };
}
