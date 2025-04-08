import SunCalc from "suncalc";
import { DateTime } from "luxon";
import { WeatherData } from "@/types/weather";
import deriveSmartSymbol from "@/app/lib/smartSymbolECMWF";
import { notFound } from "next/navigation";
import Client from "./client";

type Props = {
  params: Promise<{ city: string }>;
};

export default async function FeatherForCity({ params }: Props) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const formattedCity =
    decodedCity.charAt(0).toUpperCase() + decodedCity.slice(1).toLowerCase();

  try {
    const [fmiRes, ecmwfRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/weatherForecastFMI?city=${formattedCity}`
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/weatherForecastECMWF?city=${formattedCity}`
      ),
    ]);

    if (!fmiRes.ok || !ecmwfRes.ok) {
      console.error("One or both weather APIs returned an error", {
        fmiStatus: fmiRes.status,
        ecmwfStatus: ecmwfRes.status,
      });
      notFound();
    }

    const [fmiData, ecmwfData]: [WeatherData[], WeatherData[]] =
      await Promise.all([fmiRes.json(), ecmwfRes.json()]);

    if (!fmiData.length || !ecmwfData.length) {
      notFound();
    }

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

      if (latitude == null || longitude == null) {
        throw new Error("Missing coordinates for city");
      }
      const times = SunCalc.getTimes(new Date(), latitude, longitude);

      // Convert sunrise & sunset to HH:mm format
      sunrise = DateTime.fromJSDate(times.sunrise, { zone: "utc" })
        .setZone("Europe/Helsinki")
        .toFormat("HH:mm");
      sunset = DateTime.fromJSDate(times.sunset, { zone: "utc" })
        .setZone("Europe/Helsinki")
        .toFormat("HH:mm");

      // Convert to DateTime objects
      const sunriseDateTime = DateTime.fromJSDate(times.sunrise, {
        zone: "utc",
      }).setZone("Europe/Helsinki");
      const sunsetDateTime = DateTime.fromJSDate(times.sunset, {
        zone: "utc",
      }).setZone("Europe/Helsinki");

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
  } catch (error) {
    console.error("Weather fetch failed:", error);
    notFound();
  }
}
