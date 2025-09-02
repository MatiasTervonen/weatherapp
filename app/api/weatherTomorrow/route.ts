import { supabaseClient } from "@/utils/supabase/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseClient
    .from("weather_tomorrow")
    .select("time, temperature, smartData, location");

  if (error) {
    console.error("Error fetching weather data:", error);
    return new Response("Error fetching weather data", { status: 500 });
  }

  return NextResponse.json(data);
}
