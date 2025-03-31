import { WeatherData } from "@/types/weather";

export default function deriveSmartSymbol(data: WeatherData): number {
  const {
    temperature,
    windSpeed,
    rainProp,
    pressure,
    humidity,
    time, // ISO timestamp to check if it's day or night
    sunrise,
    sunset,
  } = data;

  // Determine if it's day or night
  const current = new Date(time);
  const sunriseTime = sunrise ? new Date(sunrise) : null;
  const sunsetTime = sunset ? new Date(sunset) : null;

  let isNight = false;

  if (sunriseTime && sunsetTime) {
    isNight = current < sunriseTime || current >= sunsetTime;
  } else {
    // Fallback: if no sunrise/sunset provided, use rough UTC hour
    const hour = current.getUTCHours();
    isNight = hour < 6 || hour >= 18;
  }

  let symbol = 7; // Default to cloudy

  // 🌫 Detect Fog Early (High Humidity, Low Wind, Low Temp)
  if (
    humidity != null &&
    humidity > 90 &&
    temperature != null &&
    temperature < 5 &&
    windSpeed != null &&
    windSpeed < 4 &&
    (rainProp == null || rainProp < 0.1)
  ) {
    symbol = 9; // Fog
  }
  // 🌩 Thunderstorms
  else if (
    rainProp != null &&
    rainProp >= 1 &&
    windSpeed != null &&
    windSpeed > 10 &&
    pressure != null &&
    pressure < 1005
  ) {
    symbol = 77; // Thundershowers
  } else if (
    rainProp != null &&
    rainProp >= 0.4 &&
    rainProp < 0.8 &&
    windSpeed != null &&
    windSpeed > 5 &&
    pressure != null &&
    pressure < 1010
  ) {
    symbol = 74; // Scattered Thunderstorms
  }
  // 🌧 Heavy Rain
  else if (
    temperature != null &&
    temperature > 0 &&
    rainProp != null &&
    rainProp >= 0.5
  ) {
    symbol = 39; // Heavy rain
  }
  // 🌧 Moderate Rain
  else if (
    temperature != null &&
    temperature > 0 &&
    rainProp != null &&
    rainProp >= 0.3
  ) {
    symbol = 38; // Moderate rain
  }
  // 🌦 Light Rain
  else if (
    temperature != null &&
    temperature > 0 &&
    rainProp != null &&
    rainProp >= 0.1
  ) {
    symbol = 37; // Light rain
  }
  // ❄ Heavy Snow
  else if (
    temperature != null &&
    temperature < 0 &&
    rainProp != null &&
    rainProp >= 0.5
  ) {
    symbol = 59; // Heavy snowfall
  }
  // ❄ Moderate Snow
  else if (
    temperature != null &&
    temperature < 0 &&
    rainProp != null &&
    rainProp >= 0.3
  ) {
    symbol = 58; // Moderate snowfall
  }
  // ❄ Light Snow
  else if (
    temperature != null &&
    temperature < 0 &&
    rainProp != null &&
    rainProp >= 0.1
  ) {
    symbol = 57; // Light snowfall
  }
  // 🌨 Heavy Sleet (räntä)
  else if (
    temperature != null &&
    temperature >= 0 &&
    temperature <= 2 &&
    rainProp != null &&
    rainProp >= 0.5
  ) {
    symbol = 49; // Heavy sleet
  }
  // 🌨 Moderate Sleet
  else if (
    temperature != null &&
    temperature >= 0 &&
    temperature <= 2 &&
    rainProp != null &&
    rainProp >= 0.3
  ) {
    symbol = 48; // Moderate sleet
  }
  // 🌨 Light Sleet
  else if (
    temperature != null &&
    temperature >= 0 &&
    temperature <= 2 &&
    rainProp != null &&
    rainProp >= 0.1
  ) {
    symbol = 47; // Light sleet
  }
  // ☀️ Clear Sky
  else if (
    pressure != null &&
    pressure >= 1012 &&
    humidity != null &&
    humidity < 50 &&
    rainProp != null &&
    rainProp <= 0.05
  ) {
    symbol = 1; // Clear
  }
  // 🌤 Mostly Clear
  else if (
    pressure != null &&
    pressure > 995 &&
    humidity != null &&
    humidity < 70 &&
    (rainProp === null || rainProp === 0)
  ) {
    symbol = 2; // Mostly clear
  }
  // ⛅ Partly Cloudy
  else if (
    pressure != null &&
    pressure > 990 &&
    humidity != null &&
    humidity < 75 &&
    (rainProp === null || rainProp === 0)
  ) {
    symbol = 4; // Partly Cloudy
  }
  // ☁️ Mostly Cloudy
  else if (
    humidity != null &&
    humidity > 85 &&
    pressure != null &&
    pressure < 990
  ) {
    symbol = 6; // Mostly cloudy
  }
  // ☁️ Cloudy (Final fallback)
  else {
    symbol = 7; // Cloudy
  }

  // 🌙 Adjust for nighttime
  return isNight ? symbol + 100 : symbol;
}
