import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("weather_reportgpt")
    .select("report, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching weather summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather summary" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    report: data?.[0]?.report || null,
    created_at: data?.[0]?.created_at || null,
  });
}
