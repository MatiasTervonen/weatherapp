import { WeatherData } from "@/types/weather";

export default function generateWeatherReport(data: WeatherData[]) {
  const locationTemp: { [location: string]: number } = {};

  data.forEach((entry) => {
    const loc = entry.location || "unknown";
    const temp = entry.temperature ?? -Infinity;

    if (!(loc in locationTemp)) {
      locationTemp[loc] = temp;
    } else {
      locationTemp[loc] = Math.max((locationTemp[loc], temp));
    }
  });

  const hottestLocation = Object.entries(locationTemp).reduce(
    (acc, [loc, temp]) => (temp > acc.temp ? { loc, temp } : acc),
    { loc: "", temp: -Infinity }
  );

  const coldestLocation = Object.entries(locationTemp).reduce(
    (acc, [loc, temp]) => (temp < acc.temp ? { loc, temp } : acc),
    { loc: "", temp: Infinity }
  );

  return { hottestLocation, coldestLocation };
}
