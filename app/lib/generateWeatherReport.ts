import { WeatherData } from "@/types/weather";

export default function generateWeatherReport(data: WeatherData[]) {
  const locationTemps: { [location: string]: { max: number; min: number } } =
    {};

  data.forEach((entry) => {
    const loc = entry.location || "unknown";
    const temp = entry.temperature ?? -Infinity;

    if (!(loc in locationTemps)) {
      locationTemps[loc] = { max: temp, min: temp };
    } else {
      locationTemps[loc].max = Math.max(locationTemps[loc].max, temp);
      locationTemps[loc].min = Math.min(locationTemps[loc].min, temp);
    }
  });

  const maxTemp = Math.max(...Object.values(locationTemps).map((v) => v.max));
  const minTemp = Math.min(...Object.values(locationTemps).map((v) => v.min));

  const hottestLocations = Object.entries(locationTemps)
    .filter(([, temps]) => temps.max === maxTemp)
    .map(([loc]) => loc);

  const coldestLocations = Object.entries(locationTemps)
    .filter(([, temps]) => temps.min === minTemp)
    .map(([loc]) => loc);

  return {
    hottest: { temp: maxTemp, locations: hottestLocations },
    coldest: { temp: minTemp, locations: coldestLocations },
  };
}
