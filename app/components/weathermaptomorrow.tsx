import Image from "next/image";
import { fetchTomorrowWeatherData } from "@/app/lib/weatherTomorrow";
import weatherMapImage from "@/assets/images/Cropped_Finland_Map.webp";
import { supabaseClient } from "@/app/lib/supabaseClient";
import { WeatherData } from "@/types/weather";

// Define city positions on your map (adjust these based on your image)
const cityPositions: { [key: string]: { top: string; left: string } } = {
  Helsinki: { top: "90%", left: "42%" },
  Turku: { top: "88%", left: "22%" },
  Oulu: { top: "50%", left: "58%" },
  Rovaniemi: { top: "40%", left: "45%" },
  Jyväskylä: { top: "76%", left: "48%" },
  Kuopio: { top: "62%", left: "70%" },
  Vaasa: { top: "75%", left: "21%" },
  Joensuu: { top: "75%", left: "80%" },
  Lappeenranta: { top: "85%", left: "65%" },
  Ylivieska: { top: "65%", left: "45%" },
  Muonio: { top: "26%", left: "40%" },
  Utsjoki: { top: "12%", left: "63%" },
  Salla: { top: "35%", left: "65%" },
};

const getTempColor = (temp: number | null | undefined) => {
  if (temp === null || temp === undefined) return "text-blue-950"; // Default color for N/A
  return temp >= 0 ? "text-red-500" : "text-blue-400";
};

export default async function FinlandWeatherMap() {
  let weatherData: WeatherData[] = [];

  try {
    const { data, error } = await supabaseClient
      .from("weatherTomorrow")
      .select("data")
      .eq("id", 1)
      .single();

    if (error || !data) throw new Error("Supabase failed");

    weatherData = data.data;
  } catch (error) {
    console.warn("Fallback to FMI api due to Supabase failure");
    weatherData = await fetchTomorrowWeatherData(); // Fallback to Helsinki data
  }

  return (
    <div className="relative">
      {/* Finland Map as Background */}
      <Image
        src={weatherMapImage}
        width={256}
        height={612}
        alt="Finland Map"
        priority
      />

      {/* Overlay Weather Data on the Map */}

      {weatherData.map((cityData) => {
        const position = cityData.location
          ? cityPositions[cityData.location]
          : undefined;
        if (!position) return null; // Skip cities without coordinates

        // Only set image path if SmartSymbol exists and is valid
        const smartSymbolImage =
          cityData.smartData !== null && cityData.smartData !== undefined
            ? `/weathericons/${cityData.smartData}.svg`
            : null; // Set to null instead of empty string

        return (
          <div
            key={cityData.location}
            className="absolute text-xs"
            style={{
              top: position.top,
              left: position.left,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="text-white text-sm">
              <p className={` font-bold ${getTempColor(cityData.temperature)}`}>
                {cityData.temperature ?? "N/A"}°C
              </p>
              {/* Render Image ONLY if smartSymbolImage is valid */}
              {smartSymbolImage && (
                <Image
                  src={smartSymbolImage}
                  alt={`Weather icon ${cityData.smartData}`}
                  width={50}
                  height={50}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
