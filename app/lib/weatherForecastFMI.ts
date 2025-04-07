import { parseStringPromise } from "xml2js"; // parses XML data to JSON format
import moment from "moment-timezone"; // handles time zone conversions
import { WeatherData } from "@/types/weather";

// Fetches the weather data for given city

export async function fetchWeatherForCityFMI(city: string): Promise<WeatherData[]> {
  try {
    const now = moment().tz("UTC");
    const startTime = now.format("YYYY-MM-DDTHH:mm:ss");

    const endTime = now.clone().add(2, "days").endOf("day");
    const formattedEndTime = endTime.format("YYYY-MM-DDTHH:mm:ss");

    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair&place=${encodeURIComponent(
      city
    )}&starttime=${startTime}&endtime=${formattedEndTime}&parameters=temperature,windspeedms,SmartSymbol,Precipitation1h&timestep=60`;

    const response = await fetch(url);
    const xmlText = await response.text();

    // Convert XML to JSON
    const jsonData = await parseStringPromise(xmlText, {
      explicitArray: false,
    });

    // extracting the weather Data from JSON Data. creates four empty objects to store them

    const features = jsonData["wfs:FeatureCollection"]["wfs:member"];
    const smartData: { [time: string]: number } = {};
    const tempData: { [time: string]: number } = {};
    const windData: { [time: string]: number } = {};
    const rainData: { [time: string]: number } = {};
    const locationName = city; // Default to city name
    let latitude: number | undefined;
    let longitude: number | undefined;

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

        // Extract latitude and longitude from <gml:pos>
        const posString =
          property["om:featureOfInterest"]?.[
            "sams:SF_SpatialSamplingFeature"
          ]?.["sams:shape"]?.["gml:MultiPoint"]?.["gml:pointMembers"]?.[
            "gml:Point"
          ]?.["gml:pos"];

        if (posString) {
          const [lat, lon] = posString.trim().split(" ").map(parseFloat);
          latitude = lat;
          longitude = lon;
        }

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
      time: new Date(time).toISOString(),
      smartData: smartData[time] ?? null,
      temperature: tempData[time] ?? null,
      windSpeed: windData[time] ?? null,
      rainProp: rainData[time] ?? null,
      location: locationName,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    }));
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return [];
  }
}

