import { supabaseClient } from "@/utils/supabase/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabaseClient
    .from("weather_summary")
    .select("summary")
    .eq("date", today)
    .maybeSingle();

  if (error) {
    return new Response("Error fetching weather data", { status: 500 });
  }

  return NextResponse.json(data);
}
