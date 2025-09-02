import { supabaseClient } from "@/utils/supabase/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabaseClient
    .from("weather_reportgpt")
    .select("report, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return new Response("Error fetching weather data", { status: 500 });
  }

  return NextResponse.json(data?.[0] ?? {});
}
