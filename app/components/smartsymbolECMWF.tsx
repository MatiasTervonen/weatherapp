export default function deriveSmartSymbol(
  temperature: number | null,
  windSpeed: number,
  rainProp: number | null,
  pressure: number | null,
  humidity: number | null,
  time: string // ISO timestamp to check if it's day or night
): number {
  // Determine if it's day or night
  const hour = new Date(time).getUTCHours();
  const isNight = hour < 6 || hour >= 18; // Night: 18:00 - 06:00 UTC

  let symbol = 7; // Default to cloudy

  // 🌩 Thunderstorms
  if (
    rainProp !== null &&
    rainProp >= 1 &&
    windSpeed > 10 &&
    pressure !== null &&
    pressure < 1005
  ) {
    symbol = 77; // Thundershowers
  } else if (
    rainProp !== null &&
    rainProp >= 0.4 && // Not necessarily extreme rain
    rainProp < 0.8 && // Keeps it distinct from heavy thunderstorms
    windSpeed > 5 && // Some wind is necessary
    pressure !== null &&
    pressure < 1010 // Slightly low pressure, but not extreme
  ) {
    symbol = 74; // Scattered Thunderstorms
  }
  // 🌧 Heavy Rain
  else if (
    temperature !== null &&
    temperature > 0 &&
    rainProp !== null &&
    rainProp >= 0.5
  ) {
    symbol = 39; // Heavy rain
  }
  // 🌧 Moderate Rain
  else if (
    temperature !== null &&
    temperature > 0 &&
    rainProp !== null &&
    rainProp >= 0.3
  ) {
    symbol = 38; // Moderate rain
  }
  // 🌦 Light Rain
  else if (
    temperature !== null &&
    temperature > 0 &&
    rainProp !== null &&
    rainProp >= 0.1
  ) {
    symbol = 37; // Light rain
  }
  // ❄ Heavy Snow
  else if (
    temperature !== null &&
    temperature < 0 &&
    rainProp !== null &&
    rainProp >= 0.5
  ) {
    symbol = 59; // Heavy snowfall
  }
  // ❄ Moderate Snow
  else if (
    temperature !== null &&
    temperature < 0 &&
    rainProp !== null &&
    rainProp >= 0.3
  ) {
    symbol = 58; // Moderate snowfall
  }
  // ❄ Light Snow
  else if (
    temperature !== null &&
    temperature < 0 &&
    rainProp !== null &&
    rainProp >= 0.1
  ) {
    symbol = 57; // Light snowfall
  }
  // 🌨 Heavy Sleet (räntä)
  else if (
    temperature !== null &&
    temperature >= 0 &&
    temperature <= 2 &&
    rainProp !== null &&
    rainProp >= 0.5
  ) {
    symbol = 49; // Heavy sleet
  }
  // 🌨 Moderate Sleet
  else if (
    temperature !== null &&
    temperature >= 0 &&
    temperature <= 2 &&
    rainProp !== null &&
    rainProp >= 0.3
  ) {
    symbol = 48; // Moderate sleet
  }
  // 🌨 Light Sleet
  else if (
    temperature !== null &&
    temperature >= 0 &&
    temperature <= 2 &&
    rainProp !== null &&
    rainProp >= 0.1
  ) {
    symbol = 47; // Light sleet
  }
  // ☀️ Clear Sky (More realistic detection)
  else if (
    pressure !== null &&
    pressure > 1000 &&
    humidity !== null &&
    humidity < 75 &&
    rainProp === 0
  ) {
    symbol = 1; // Clear
  }
  // 🌤 Mostly Clear
  else if (
    pressure !== null &&
    pressure > 995 &&
    humidity !== null &&
    humidity < 80 &&
    rainProp === 0
  ) {
    symbol = 2; // Mostly clear
  }
  // ⛅ Partly Cloudy
  else if (
    pressure !== null &&
    pressure > 990 &&
    humidity !== null &&
    humidity < 85 &&
    rainProp === 0
  ) {
    symbol = 4; // Partly Cloudy
  }
  // ☁️ Mostly Cloudy
  else if (
    humidity !== null &&
    humidity > 85 &&
    pressure !== null &&
    pressure < 990
  ) {
    symbol = 6; // Mostly cloudy
  }
  // 🌫 Sumun tunnistaminen
  else if (
    humidity !== null &&
    humidity > 90 && // Korkea ilmankosteus
    temperature !== null &&
    temperature < 5 && // Matala lämpötila
    windSpeed < 4 && // Heikko tuuli
    (rainProp === null || rainProp < 0.1) // Ei merkittävää sadetta
  ) {
    symbol = 9; // Sumua
  }
  // ☁️ Cloudy (final fallback)
  else {
    symbol = 7; // Cloudy
  }

  // 🌙 Adjust for nighttime (SmartSymbol + 100)
  return isNight ? symbol + 100 : symbol;
}
