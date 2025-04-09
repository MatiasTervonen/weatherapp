import { NextResponse } from "next/server";

export async function GET() {
  console.log("🟢 cron-test HIT:", new Date().toISOString());
  return NextResponse.json({ message: "cron-test worked" });
}
