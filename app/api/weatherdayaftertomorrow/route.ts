import { NextResponse } from "next/server"; // Handles the API call
import { parseStringPromise } from "xml2js"; // Parses XML data to JSON format

// Define the types for weather data
interface WeatherData {
  time: string;
  temperature?: number | null;
  windSpeed?: number | null;
  location?: string; // Store the location
}

// List of cities that the API is fetching
const cities = [
  "Helsinki",
  "Turku",
  "Oulu",
  "Rovaniemi",
  "Jyväskylä",
  "Kuopio",
  "Vaasa",
  "Joensuu",
  "Lappeenranta",
  "Ylivieska",
  "Muonio",
  "Utsjoki",
  "Salla",
];

// Fetches the weather data for a given city
async function fetchWeatherForCity(city: string): Promise<WeatherData[]> {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 2);

    const isoDate = tomorrow.toISOString().split("T")[0];

    const startTime = `${isoDate}T14:00:00Z`;
    const endtTime = `${isoDate}T14:00:00Z`;

    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair&place=${encodeURIComponent(
      city
    )}&starttime=${startTime}&endtime=${endtTime}&parameters=temperature,windspeedms,SmartSymbol`;

    const response = await fetch(url);
    const xmlText = await response.text();

    // Convert XML to JSON
    const jsonData = await parseStringPromise(xmlText, {
      explicitArray: false, // Makes sure single values are not put into arrays
    });

    // Ensure the feature collection exists
    const features = jsonData?.["wfs:FeatureCollection"]?.["wfs:member"];
    if (!features) {
      console.error(`No weather features found for ${city}`);
      return [];
    }

    // Ensure `features` is always an array
    const featureArray = Array.isArray(features) ? features : [features];

    const tempData: { [time: string]: number } = {};
    const windData: { [time: string]: number } = {};
    const smartData: { [time: string]: number } = {};
    const locationName = city; // Default to city name

    // Process weather features
    featureArray.forEach((feature) => {
      const property = feature["omso:PointTimeSeriesObservation"];
      if (!property) return;

      const observedProperty =
        property["om:observedProperty"]["$"]["xlink:href"];
      const isSmartData = observedProperty.includes("SmartSymbol");
      const isTemperature = observedProperty.includes("temperature");
      const isWindSpeed = observedProperty.includes("windspeedms");

      // Extract observations
      const observations =
        property?.["om:result"]?.["wml2:MeasurementTimeseries"]?.["wml2:point"];

      if (!observations) {
        console.error(`No observations found for ${city}`);
        return;
      }

      // Ensure `observations` is always an array
      const observationsArray = Array.isArray(observations)
        ? observations
        : [observations];

      observationsArray.forEach((entry) => {
        const time = entry["wml2:MeasurementTVP"]?.["wml2:time"];
        const value = parseFloat(entry["wml2:MeasurementTVP"]?.["wml2:value"]);

        if (!time || isNaN(value)) {
          console.error(`Invalid observation data for ${city}:`, entry);
          return;
        }

        if (isTemperature) tempData[time] = value;
        else if (isWindSpeed) windData[time] = value;
        else if (isSmartData) smartData[time] = value;
      });
    });

    // Merge weather data
    const allTimes = Array.from(
      new Set([
        ...Object.keys(tempData),
        ...Object.keys(windData),
        ...Object.keys(smartData),
      ])
    ).sort();

    return allTimes.map((time) => ({
      time,
      smartData: smartData[time] ?? null,
      temperature: tempData[time] ?? null,
      windSpeed: windData[time] ?? null,
      location: locationName,
    }));
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return [];
  }
}

export async function GET(): Promise<
  NextResponse<WeatherData[] | { error: string }>
> {
  try {
    // Fetch weather data for all cities
    const weatherDataPromises = cities.map(fetchWeatherForCity);
    const weatherResults = await Promise.all(weatherDataPromises);

    // Flatten the results
    const allWeatherData: WeatherData[] = weatherResults.flat();

    // Log for debugging
    console.log("Final Weather Data:", JSON.stringify(allWeatherData, null, 2));

    // Directly return the weather data without filtering
    return NextResponse.json(allWeatherData, {
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