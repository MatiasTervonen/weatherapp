import { NextResponse, NextRequest } from "next/server"; // handels the Api call
import { parseStringPromise } from "xml2js"; // parses XML data to JSON format
import moment from "moment-timezone"; // handles time zone conversions
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { smartSymbolMap } from "@/app/lib/smartSymbolMap";
import { AllAvailableCities } from "@/app/lib/allAvailableCities";

// Fetches the weather data for given city

interface WeatherData {
  time: string;
  temperature?: number | null;
  windSpeed?: number | null;
  rainProp?: number | null;
  location?: string;
  condition: number | string | null;
}

async function fetchWeatherForCity(city: string): Promise<WeatherData[]> {
  try {
    const now = moment().tz("UTC");
    const startTime = now.format("YYYY-MM-DDTHH:mm:ss");

    const endTime = now.clone().add(0, "days").endOf("day");
    const formattedEndTime = endTime.format("YYYY-MM-DDTHH:mm:ss");

    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair&place=${encodeURIComponent(
      city
    )}&starttime=${startTime}&endtime=${formattedEndTime}&parameters=temperature,windspeedms,Precipitation1h,SmartSymbol&timestep=120`;

    const response = await fetch(url);
    const xmlText = await response.text();

    // Convert XML to JSON
    const jsonData = await parseStringPromise(xmlText, {
      explicitArray: false,
    });

    // extracting the weather Data from JSON Data. creates four empty objects to store them

    const features = jsonData["wfs:FeatureCollection"]["wfs:member"];
    const condition: { [time: string]: number } = {};
    const tempData: { [time: string]: number } = {};
    const windData: { [time: string]: number } = {};
    const rainData: { [time: string]: number } = {};
    const locationName = city; // Default to city name

    // Iterating through weather features

    if (Array.isArray(features)) {
      features.forEach((feature) => {
        const property = feature["omso:PointTimeSeriesObservation"];
        const observedProperty =
          property["om:observedProperty"]["$"]["xlink:href"];

        // Determine if it's temperature, wind speed, or SmartSymbol
        const isSmartData = observedProperty.includes("SmartSymbol");
        const isTemperature = observedProperty.includes("temperature");
        const isWindSpeed = observedProperty.includes("windspeedms");
        const isRainData = observedProperty.includes("Precipitation1h");

        const observations =
          property["om:result"]["wml2:MeasurementTimeseries"]["wml2:point"];

        // Stroring data in objects

        if (Array.isArray(observations)) {
          observations.forEach((entry) => {
            const time = entry["wml2:MeasurementTVP"]["wml2:time"];
            const value = parseFloat(
              entry["wml2:MeasurementTVP"]["wml2:value"]
            );

            if (isTemperature) tempData[time] = Math.round(value);
            else if (isWindSpeed) windData[time] = Math.round(value);
            else if (isSmartData) condition[time] = value;
            else if (isRainData) rainData[time] = value;
          });
        }
      });
    }

    // Merge weather data
    const allTimes = Array.from(
      new Set([
        ...Object.keys(condition),
        ...Object.keys(tempData),
        ...Object.keys(windData),
        ...Object.keys(rainData),
      ])
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return allTimes.map((time) => {
      const rawCode = condition[time];
      const code = rawCode !== undefined ? Number(rawCode) % 100 : undefined;

      return {
        time: new Date(time).toISOString(),
        condition:
          code !== undefined ? smartSymbolMap[code] ?? "unknown" : null,
        temperature: tempData[time] ?? null,
        windSpeed: windData[time] ?? null,
        rainProp: rainData[time] ?? null,
        location: locationName,
      };
    });
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return [];
  }
}

// Updated GET function to fetch weather for a specific city
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // Check if there's a cached weather summary for today
    const { data: cached, error: cacheError } = await supabaseAdmin
      .from("weather_summary")
      .select("summary")
      .eq("date", today)
      .single();

    if (cached && !cacheError) {
      console.log("Weather summary found in cache");
      return NextResponse.json(cached.summary, {
        headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate" },
      });
    }

    //  no cache fetch and save to cache
    const cities = AllAvailableCities;

    const allWeatherData = await Promise.all(
      cities.map((cityName) => fetchWeatherForCity(cityName))
    );

    const flattenedData = allWeatherData.flat();

    if (flattenedData.length === 0) {
      return NextResponse.json(
        { error: "No weather data available" },
        { status: 404 }
      );
    }

    const summary = flattenedData;

    // Save the summary to Supabase
    await supabaseAdmin.from("weather_summary").insert([
      {
        date: today,
        summary,
      },
    ]);

    await fetch(`${process.env.BASE_URL}/api/OpenAI`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    return NextResponse.json(summary, {
      headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate" },
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return NextResponse.json(
      { error: "Failed to process FMI weather data" },
      { status: 500 }
    );
  }
}
