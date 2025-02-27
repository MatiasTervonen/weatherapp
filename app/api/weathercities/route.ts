import { NextResponse } from "next/server"; // handels the Api call
import { parseStringPromise } from "xml2js"; // parses XML data to JSON format

// Define the types for weather data
interface WeatherData {
  time: string;
  temperature?: number | null;
  windSpeed?: number | null;
  rainProp?: number | null;
  smartData?: number | null;
  location?: string; // Store the location
}

// list of Cities that api is fetching

// Fetches the weather data for given city

async function fetchWeatherForCity(city: string): Promise<WeatherData[]> {
  try {
    const now = new Date();
    const startTime = now.toISOString().split(".")[0] + "Z";

    const endTime = new Date(now);
    endTime.setUTCDate(endTime.getUTCDate() + 2);
    endTime.setUTCHours(23, 59, 0, 0);

    const formattedEndTime = endTime.toISOString().split(".")[0] + "Z";

    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair&place=${encodeURIComponent(
      city
    )}&starttime=${startTime}&endtime=${formattedEndTime}&parameters=temperature,windspeedms,SmartSymbol,Precipitation1h&timestep=60`;

    console.log("API Request URL:", url);

    const response = await fetch(url);
    const xmlText = await response.text();

    // Convert XML to JSON
    const jsonData = await parseStringPromise(xmlText, {
      explicitArray: false,
    });

    console.log("Full API Response:", JSON.stringify(jsonData, null, 2));

    // extracting the weather Data from JSON Data. creates three empty objects to store them

    const features = jsonData["wfs:FeatureCollection"]["wfs:member"];
    const smartData: { [time: string]: number } = {};
    const tempData: { [time: string]: number } = {};
    const windData: { [time: string]: number } = {};
    const rainData: { [time: string]: number } = {};
    const locationName = city; // Default to city name

    // Iterating through wather features

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

        // Stroring datain objects

        if (Array.isArray(observations)) {
          observations.forEach((entry) => {
            const time = entry["wml2:MeasurementTVP"]["wml2:time"];
            const value = parseFloat(
              entry["wml2:MeasurementTVP"]["wml2:value"]
            );

            if (isTemperature) tempData[time] = Math.round(value);
            else if (isWindSpeed) windData[time] = Math.round(value);
            else if (isSmartData) smartData[time] = value;
            else if (isRainData) rainData[time] = value;
          });
        }
      });
    }

    // Merge weather data
    const allTimes = Array.from(
      new Set([
        ...Object.keys(smartData),
        ...Object.keys(tempData),
        ...Object.keys(windData),
        ...Object.keys(rainData),
      ])
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return allTimes.map((time) => ({
      time: new Date(time).toISOString(), // ✅ Ensures timestamps remain in UTC
      smartData: smartData[time] ?? null,
      temperature: tempData[time] ?? null,
      windSpeed: windData[time] ?? null,
      rainProp: rainData[time] ?? null,
      location: locationName,
    }));
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return [];
  }
}

// Updated GET function to fetch weather for a specific city
export async function GET(
  req: Request
): Promise<NextResponse<WeatherData[] | { error: string }>> {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    if (!city) {
      return NextResponse.json(
        { error: "City parameter is required" },
        { status: 400 }
      );
    }

    const weatherData: WeatherData[] = await fetchWeatherForCity(city);

    if (weatherData.length === 0) {
      return NextResponse.json(
        { error: "No weather data available for this city" },
        { status: 404 }
      );
    }

    return NextResponse.json(weatherData, {
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
