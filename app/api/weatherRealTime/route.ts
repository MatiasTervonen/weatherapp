import { supabaseClient } from "@/utils/supabase/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseClient
    .from("weather_realtime")
    .select("time, temperature, smartData, location");

  if (error) {
    console.error("Error fetching weather data:", error);
    return new Response("Error fetching weather data", { status: 500 });
  }

  console.log("Fetched weather data:", data);

  return NextResponse.json(data);
}
