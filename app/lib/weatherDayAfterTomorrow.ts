import { parseStringPromise } from "xml2js"; // Parses XML data to JSON format
import { WeatherData } from "@/types/weather";
import moment from "moment-timezone";

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
    const targetDate = moment
      .tz("Europe/Helsinki")
      .add(2, "days")
      .set({ hour: 15, minute: 0, second: 0 }); // 15:00 in Helsinki
    const startTime =
      targetDate.clone().utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
    const endtTime = startTime;

    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::harmonie::surface::point::timevaluepair&place=${encodeURIComponent(
      city
    )}&starttime=${startTime}&endtime=${endtTime}&parameters=temperature,SmartSymbol`;

    const response = await fetch(url, { next: { tags: ["weather-map"] } });
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

    if (!features) {
      console.warn(`Missing weather data for ${city}`);
    }

    // Ensure `features` is always an array
    const featureArray = Array.isArray(features) ? features : [features];

    const tempData: { [time: string]: number } = {};
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

        if (isTemperature) tempData[time] = Math.round(value);
       
        else if (isSmartData) smartData[time] = value;
      });
    });

    // Merge weather data
    const allTimes = Array.from(
      new Set([
        ...Object.keys(tempData),  
        ...Object.keys(smartData),
      ])
    ).sort();

    return allTimes.map((time) => ({
      time,
      smartData: smartData[time] ?? null,
      temperature: tempData[time] ?? null,
      location: locationName,
    }));
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return [];
  }
}

export async function fetchDayAfterTomorrowWeatherData(): Promise<
  WeatherData[]
> {
  // Fetch weather data for all cities
  const weatherDataPromises = cities.map(fetchWeatherForCity);
  const weatherResults = await Promise.all(weatherDataPromises);

  // Flatten the results
  const allWeatherData: WeatherData[] = weatherResults.flat();

  console.log("dayafterTomorrow Data fetched", allWeatherData);

  return allWeatherData;
}
