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
  
    let symbol = 7; 
  
    // 🌩 Thunderstorm
    if (
      rainProp !== null &&
      rainProp >= 1 &&
      windSpeed > 10 &&
      pressure !== null &&
      pressure < 1005
    ) {
      symbol = 77; // Thundershowers
    }
    // 🌧 Heavy Rain
    else if (rainProp !== null && rainProp >= 0.5) {
      symbol = 39; // Heavy rain
    }
    // 🌧 Moderate Rain
    else if (rainProp !== null && rainProp >= 0.3) {
      symbol = 38; // Moderate rain
    }
    // 🌦 Light Rain
    else if (rainProp !== null && rainProp >= 0.1) {
      symbol = 37; // Light rain
    }
    // 🌨 Snow
    else if (
      temperature !== null &&
      temperature < 0 &&
      rainProp !== null &&
      rainProp >= 0.1
    ) {
      symbol = 57; // Light snowfall
    }
    // 🌬 Windy
    else if (windSpeed > 15 && pressure !== null && pressure < 1010) {
      symbol = 6; // Windy (mostly cloudy)
    }
    // ☀️ Clear
    else if (
      pressure !== null &&
      pressure > 1015 &&
      humidity !== null &&
      humidity < 70 &&
      rainProp !== null &&
      rainProp < 0.1
    ) {
      symbol = 1; // Clear sky
    }
    // 🌤 Partly Cloudy
    else if (
      pressure !== null &&
      pressure > 1010 &&
      humidity !== null &&
      humidity < 80 &&
      rainProp !== null &&
      rainProp < 0.1
    ) {
      symbol = 4; // Partly Cloudy
    }
    // ☁️ Cloudy
    else {
      symbol = 7; // Default Cloudy
    }
  
    // 🌙 Adjust for nighttime (SmartSymbol + 100)
    return isNight ? symbol + 100 : symbol;
  }