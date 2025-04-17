import { NextResponse } from "next/server";
import { fetchRadarData } from "@/app/lib/radarData";

export async function GET() {
  try {
    const radarData = await fetchRadarData();

    if (!radarData || radarData.length === 0) {
      return NextResponse.json(
        { error: "No radar data available" },
        { status: 404 }
      );
    }

    return NextResponse.json(radarData); //  Return JSON response
  } catch (error) {
    console.error("Error fetching radar data:", error); // Log the error
    return NextResponse.json(
      { error: "Failed to fetch radar data" },
      { status: 500 }
    );
  }
}
