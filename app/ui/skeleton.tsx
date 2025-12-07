// skeleton when searching cities

export function PageSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 dark:bg-slate-950">
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
  Utsjoki: { top: "12%", left: "60%" },
  Salla: { top: "35%", left: "65%" },
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

export function SkeletonWarning() {
  return (
    <div className="animate-pulse w-full max-w-5xl">
      <div className="text-xl py-6">
        <div className="h-6 bg-gray-300 rounded "></div>
      </div>
      <div>
        <div className="h-4 bg-gray-300 rounded  mb-2"></div>
        <div className="h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonWeatherReport() {
  return (
    <div className="xl:w-md h-full bg-blue-200 md-plus:rounded-xl p-5 pb-10 border-y-2 md-plus:border-2 border-gray-100 dark:bg-slate-950 dark:text-gray-100">
      <div className="animate-pulse flex flex-col items-center">
        <div className="bg-gray-300 dark:bg-gray-700 h-6 mb-5 w-2/4 rounded" />

        <div className="flex flex-col gap-5 w-full">
          <div className="bg-gray-300 h-4  rounded"></div>
          <div className="bg-gray-300 h-4  rounded"></div>
          <div className="bg-gray-300 h-4  rounded"></div>
          <div className="bg-gray-300 h-4  rounded"></div>
          <div className="bg-gray-300 h-4  rounded"></div>
        </div>
      </div>
    </div>
  );
}
