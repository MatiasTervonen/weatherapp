import Maplibre from "../components/maplibre";
import { fetchRadarData } from "../lib/radarData";

interface RadarData {
  time: string;
  url: string;
}

export default async function RadarPage() {
  let error = null; // Initialize error variable
  let radarData: RadarData[] = []; // Initialize simplified variable

  try {
    const rawData = await fetchRadarData(); // Fetch radar data

    radarData = rawData.map((data) => ({
      time: data.time,
      url: data.url,
    }));
  } catch (error) {
    error = "Failed to load radar data"; // Handle error
  }

  return <Maplibre radarData={radarData} error={error} />;
}
