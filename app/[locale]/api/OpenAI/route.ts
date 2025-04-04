import { supabaseAdmin } from "../../lib/supabaseAdmin";
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

    const prompt = `You are a weather assistant. Based on the following data, write a short (under 50 words), friendly weather summary describing today’s national weather trend in a clear, engaging way. Avoid starting with the word "Finland" — focus on the weather itself.

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

    const { error: insertError } = await supabaseAdmin
      .from("weather_reportgpt")
      .insert([{ date: today, report }]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to insert report", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error generating weather report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
