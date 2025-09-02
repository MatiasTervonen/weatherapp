import { supabaseAdmin } from "../../utils/supabase/supabaseAdmin";

type WeatherResponse = {
  report: string | null;
  created_at: string | null;
  error: string | null;
};

export async function getWeatherFromDB(): Promise<WeatherResponse> {
  const { data, error } = await supabaseAdmin
    .from("weather_reportgpt")
    .select("report, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return {
      report: null,
      created_at: null,
      error: "Failed to fetch weather report",
    };
  }

  if (!data || data.length === 0) {
    return {
      report: null,
      created_at: null,
      error: "No weather report available",
    };
  }

  return {
    report: data?.[0]?.report || null,
    created_at: data?.[0]?.created_at || null,
    error: null,
  };
}
