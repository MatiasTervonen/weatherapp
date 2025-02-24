// Skeleton when searching cities

export function PageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100">
      <div className="animate-pulse bg-white p-6 rounded-md shadow-md w-3/4 max-w-lg">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  );
}

// Skeleton when weather on map is loading

const cityPositions: { [key: string]: { top: string; left: string } } = {
  Helsinki: { top: "90%", left: "50%" },
  Turku: { top: "88%", left: "40%" },
  Oulu: { top: "50%", left: "55%" },
  Rovaniemi: { top: "40%", left: "50%" },
  Jyväskylä: { top: "76%", left: "50%" },
  Kuopio: { top: "65%", left: "60%" },
  Vaasa: { top: "75%", left: "40%" },
  Joensuu: { top: "75%", left: "65%" },
  Lappeenranta: { top: "85%", left: "60%" },
  Ylivieska: { top: "65%", left: "48%" },
  Muonio: { top: "25%", left: "48%" },
  Utsjoki: { top: "12%", left: "58%" },
  Salla: { top: "35%", left: "60%" },
};

export function WeatherMapSkeleton() {
  return (
    <>
      {Object.entries(cityPositions).map(([city, position]) => (
        <div
          key={city}
          className="absolute animate-pulse bg-gray-300 rounded-md w-16 h-12 flex items-center justify-center"
          style={{
            top: position.top,
            left: position.left,
            transform: "translate(-50%, -50%)",
          }}
        ></div>
      ))}
    </>
  );
}
