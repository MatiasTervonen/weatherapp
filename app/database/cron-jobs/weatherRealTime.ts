import { parseStringPromise } from "xml2js"; // parses XML data to JSON format
import { WeatherData } from "@/types/weather";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

// list of Cities that api is fetching

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

// Fetches the weather data for given city

async function fetchWeatherForCity(city: string) {
  try {
    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::observations::weather::timevaluepair&parameters=SmartSymbol,temperature,windspeedms&place=${encodeURIComponent(
      city
    )}`;

    const response = await fetch(url); // Fetching data from the API
    const xmlText = await response.text();

    // Convert XML to JSON
    const jsonData = await parseStringPromise(xmlText, {
      explicitArray: false,
    });

    // extracting the weather Data from JSON Data. creates three empty objects to store them

    const features = jsonData["wfs:FeatureCollection"]["wfs:member"];
    const smartData: { [time: string]: number } = {};
    const tempData: { [time: string]: number } = {};
    const windData: { [time: string]: number } = {};
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
            else if (isSmartData) smartData[time] = value;
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
      ])
    ).sort();

    return allTimes.map((time) => ({
      time,
      smartData: smartData[time] ?? null,
      temperature: tempData[time] ?? null,
      windSpeed: windData[time] ?? null,
      location: locationName,
    }));
  } catch {
    return [];
  }
}

export async function fetchRealTimeWeatherData(): Promise<WeatherData[]> {
  if (!cities || cities.length === 0) return [];

  const weatherResults = await Promise.all(cities.map(fetchWeatherForCity));
  const flattenedResults = weatherResults.flat(); // Flatten the array of arrays

  const latestWeatherData = flattenedResults.reduce((acc, entry) => {
    const existingEntry = acc[entry.location];

    // If there's no entry yet or the new one is more recent, update it
    if (!existingEntry || new Date(entry.time) > new Date(existingEntry.time)) {
      acc[entry.location] = entry;
    }

    return acc;
  }, {} as Record<string, WeatherData>);

  return Object.values(latestWeatherData);
}

export async function updateWeatherData(): Promise<WeatherData[]> {
  const weatherData = await fetchRealTimeWeatherData();

  const formattedData = weatherData.map((d) => ({
    ...d,
    time: new Date(d.time).toISOString(), // ensure ISO timestamp
  }));

  // Update the Supabase database with the latest weather data
  const { error } = await supabaseAdmin
    .from("weather_realtime")
    .upsert(formattedData, { onConflict: "location" });

  if (error) {
    return [];
  }

  return weatherData;
}
