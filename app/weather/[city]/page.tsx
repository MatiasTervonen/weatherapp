import SunCalc from "suncalc";
import { DateTime } from "luxon";
import { WeatherData } from "@/types/weather";
import deriveSmartSymbol from "../../lib/smartSymbolECMWF";
import { notFound } from "next/navigation";
import Client from "./client";

export default async function FeatherForCity({
  params,
}: {
  params: { city: string };
}) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const formattedCity =
    decodedCity.charAt(0).toUpperCase() + decodedCity.slice(1).toLowerCase();

  try {
    const [fmiRes, ecmwfRes] = await Promise.all([
      fetch(
        `${process.env.BASE_URL}/api/weathercities?city=${encodeURIComponent(
          decodedCity
        )}`
      ),
      fetch(
        `${process.env.BASE_URL}/api/weatherforecast?city=${encodeURIComponent(
          decodedCity
        )}`
      ),
    ]);

    if (!fmiRes.ok || !ecmwfRes.ok) {
      notFound();
    }

    const [fmiData, ecmwfData] = await Promise.all([
      fmiRes.json(),
      ecmwfRes.json(),
    ]);

    const emcwfWeatherData = ecmwfData.map((data: WeatherData) => ({
      ...data,
      smartData: deriveSmartSymbol(data),
    }));

    let sunrise = null;
    let sunset = null;
    let dayLengthFormatted = null;

    // Calculate sunrise and sunset times
    if (fmiData.length > 0) {
      const { latitude, longitude } = fmiData[0];

      const times = SunCalc.getTimes(new Date(), latitude, longitude);

      // Convert sunrise & sunset to HH:mm format
      sunrise = DateTime.fromJSDate(times.sunrise).toFormat("HH:mm");
      sunset = DateTime.fromJSDate(times.sunset).toFormat("HH:mm");

      // Convert to DateTime objects
      const sunriseDateTime = DateTime.fromJSDate(times.sunrise);
      const sunsetDateTime = DateTime.fromJSDate(times.sunset);

      // Calculate day
      const dayLength = sunsetDateTime.diff(sunriseDateTime, [
        "hours",
        "minutes",
      ]);
      dayLengthFormatted = `${dayLength.hours}h ${Math.round(
        dayLength.minutes
      )}m`;
    }

    return (
      <>
        <Client
          formattedCity={formattedCity}
          fmiWeatherData={fmiData}
          ecmwfWeatherData={emcwfWeatherData}
          sunrise={sunrise}
          sunset={sunset}
          dayLengthFormatted={dayLengthFormatted}
        />
      </>
    );
  } catch (_error) {
    notFound();
  }
}
