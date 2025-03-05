import { NextResponse } from "next/server"; // handels the Api call
import { parseStringPromise } from "xml2js"; // parses XML data to JSON format

// Define the types for weather data
interface WeatherData {
  time: string;
  temperature?: number | null;
  windSpeed?: number | null;
  location?: string; // Store the location
}

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
    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::observations::weather::timevaluepair&parameters=SmartSymbol,temperature,ws_10min&place=${encodeURIComponent(
      city
    )}`;

    const response = await fetch(url);
    const xmlText = await response.text();

    // Convert XML to JSON
    const jsonData = await parseStringPromise(xmlText, {
      explicitArray: false,
    });

    console.log(jsonData);

    // extracting the weather Data from JSON Data. creates three empty objects to store them

    const features = jsonData["wfs:FeatureCollection"]["wfs:member"];
    const smartData: { [time: string]: number } = {};
    const tempData: { [time: string]: number } = {};
    const windData: { [time: string]: number } = {};
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
        const isWindSpeed = observedProperty.includes("ws_10min");

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
            else if (isWindSpeed) windData[time] = value;
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
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Fetch weather data for all cities
    const weatherDataPromises = cities.map(fetchWeatherForCity);
    const weatherResults = await Promise.all(weatherDataPromises);

    // Flatten the results
    const allWeatherData = weatherResults.flat();

    // Reduce the data to only keep the latest entry per city
    const latestWeatherData = allWeatherData.reduce((acc, entry) => {
      const existingEntry = acc[entry.location];

      // If there's no entry yet or the new one is more recent, update it
      if (
        !existingEntry ||
        new Date(entry.time) > new Date(existingEntry.time)
      ) {
        acc[entry.location] = entry;
      }

      return acc;
    }, {} as Record<string, WeatherData>);

    // Convert to an array
    const latestWeatherArray = Object.values(latestWeatherData);

    return NextResponse.json(latestWeatherArray, {
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
