export async function fetchWeatherData() {
  try {
    const response = await fetch("/api/weather");
    if (!response.ok) {
      throw new Error("failed to fetch weather data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data: ", error);
    return [];
  }
}

export async function getLatestWeatherData() {
  const weatherData = await fetchWeatherData();
  if (weatherData.length === 0) return null;

  return weatherData[weatherData.length - 1];
}
