import Image from "next/image";
import { fetchRealTimeWeatherData } from "@/app/lib/weatherRealTime"; // Adjust the import path as necessary

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
  const weatherData = await fetchRealTimeWeatherData();

  return (
    <div className="relative">
      {/* Finland Map as Background */}

      <Image
        src="/Cropped_Finland_Map.webp"
        width={256}
        height={612}
        alt="Finland Map"
        priority
      />

      {/* Overlay Weather Data on the Map */}

      {Object.entries(cityPositions).map(([city, position]) => {
        const cityData = weatherData.find((data) => data.location === city);
        const hasData = cityData && cityData.temperature !== null;

        // Only set image path if SmartSymbol exists and is valid
        const smartSymbolImage =
          cityData?.smartData !== null &&
          cityData?.smartData !== undefined &&
          !Number.isNaN(cityData.smartData)
            ? `/weathericons/${cityData.smartData}.svg`
            : null; // Set to null instead of empty string

        return (
          <div
            key={cityData?.location}
            className="absolute text-xs"
            style={{
              top: position.top,
              left: position.left,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="text-white text-sm text-center">
              {hasData ? (
                <>
                  <p
                    className={` font-bold ${getTempColor(
                      cityData.temperature
                    )}`}
                  >
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
                </>
              ) : (
                <>
                  <p className="font-bold text-gray-500">N/A</p>
                  <Image
                    src="/weathericons/7.svg"
                    alt={`Weather icon N/A`}
                    width={50}
                    height={50}
                  />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
