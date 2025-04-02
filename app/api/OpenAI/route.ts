import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store in .env.local
});

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const today = new Date().toISOString().split("T")[0];

  try {
    const { data, error } = await supabaseAdmin
      .from("weather_summary")
      .select("summary")
      .eq("date", today)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "No weather data available" },
        { status: 404 }
      );
    }

    const weatherData = data.summary;

    const prompt = `You are a weather assistant. Based on the following data, generate a short, friendly weather report for today (no longer than 50 words), summarizing the general weather conditions across Finland. Do not list each city separately — instead, describe the national trend in a clean and concise way.

    Weather data: ${JSON.stringify(weatherData)}`;

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly weather assistant that writes brief national summaries suitable for frontend display (like a news site). Avoid listing locations individually unless relevant to the whole country.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    const report = chatResponse.choices[0].message.content;

    await supabaseAdmin
      .from("weather_reportgpt")
      .insert([{ date: today, report }]);

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error generating weather report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
