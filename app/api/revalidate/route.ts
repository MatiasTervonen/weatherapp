import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    revalidateTag("weather-map");

    // Optional: small delay to ensure invalidation has propagated
    await sleep(500);

    // Force a fetch to trigger the rebuild
    await fetch(`${process.env.BASE_URL}/?cron=${Date.now()}`, {
      headers: {
        "User-Agent": "CronBot",
        "Cache-Control": "no-store", // forces cache bypass
        Accept: "text/html",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json(
      { message: "Error revalidating", error },
      { status: 500 }
    );
  }
}
