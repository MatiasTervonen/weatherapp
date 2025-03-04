import { NextResponse } from "next/server"; // handles the API call
import { parseStringPromise } from "xml2js"; // parses XML data to JSON format

// Define the type for weather data
interface WeatherData {
  time: string;
  temperature?: number | null;
  windSpeed?: number | null;
  rainProp?: number | null;
  humidity?: number | null;
  pressure?: number | null;
  location?: string;
}

// Fetches the weather data for a given city
async function fetchWeatherForCity(city: string): Promise<WeatherData[]> {
  try {
    const now = new Date();
    now.setUTCDate(now.getUTCDate() + 2);
    const startTime = now.toISOString().split(".")[0] + "Z";

    const endTime = new Date(now);
    endTime.setUTCDate(endTime.getUTCDate() + 7);
    endTime.setUTCHours(23, 59, 0, 0);

    const formattedEndTime = endTime.toISOString().split(".")[0] + "Z";

    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=ecmwf::forecast::surface::point::timevaluepair&place=${encodeURIComponent(
      city
    )}&starttime=${startTime}&endtime=${formattedEndTime}&parameters=temperature,WindUMS,WindVMS,Humidity,Pressure,Precipitation1h&timestep=120`;

    const response = await fetch(url);
    const xmlText = await response.text();

    // Convert XML to JSON
    const jsonData = await parseStringPromise(xmlText, {
      explicitArray: false,
    });

    // Extracting weather data
    const features = jsonData["wfs:FeatureCollection"]["wfs:member"];
    const tempData: { [time: string]: number } = {};
    const winduData: { [time: string]: number } = {};
    const windvData: { [time: string]: number } = {};
    const rainData: { [time: string]: number } = {};
    const humidityData: { [time: string]: number } = {};
    const pressureData: { [time: string]: number } = {};
    const locationName = city; // Default to city name

    if (Array.isArray(features)) {
      features.forEach((feature) => {
        const property = feature["omso:PointTimeSeriesObservation"];
        const observedProperty =
          property["om:observedProperty"]["$"]["xlink:href"];

        const isTemperature = observedProperty.includes("temperature");
        const isWindUMS = observedProperty.includes("WindUMS");
        const isWindVMS = observedProperty.includes("WindVMS");
        const isRainData = observedProperty.includes("Precipitation1h");
        const isHumidityData = observedProperty.includes("Humidity");
        const isPressureData = observedProperty.includes("Pressure");

        const observations =
          property["om:result"]["wml2:MeasurementTimeseries"]["wml2:point"];

        if (Array.isArray(observations)) {
          observations.forEach((entry) => {
            const time = entry["wml2:MeasurementTVP"]["wml2:time"];
            const value = parseFloat(
              entry["wml2:MeasurementTVP"]["wml2:value"]
            );

            if (isTemperature) tempData[time] = Math.round(value);
            else if (isWindUMS) winduData[time] = value;
            else if (isWindVMS) windvData[time] = value;
            else if (isHumidityData) humidityData[time] = value;
            else if (isPressureData) pressureData[time] = value;
            else if (isRainData) rainData[time] = value;
          });
        }
      });
    }

    // Merge all times and compute wind speed
    const allTimes = Array.from(
      new Set([
        ...Object.keys(tempData),
        ...Object.keys(winduData),
        ...Object.keys(windvData),
        ...Object.keys(rainData),
        ...Object.keys(humidityData),
        ...Object.keys(pressureData),
      ])
    ).sort();

    console.log(allTimes);

    return allTimes.map((time) => {
      const windU = winduData[time] ?? 0;
      const windV = windvData[time] ?? 0;
      const windSpeed = Math.round(Math.sqrt(windU ** 2 + windV ** 2)); // Calculate total wind speed

      return {
        time,
        temperature: tempData[time] ?? null,
        windSpeed: windSpeed, // Wind speed calculated from WindUMS and WindVMS
        rainProp: rainData[time] ?? null,
        humidity: humidityData[time] ?? null,
        pressure: pressureData[time] ?? null,
        location: locationName,
      };
    });
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
