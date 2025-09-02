
import WeatherReportGPT from "./components/weatherReportGPT";
import { SkeletonWeatherReport } from "./ui/skeleton";
import { Suspense } from "react";
import WeatherMapSwitcher from "./components/WeatherMapSwitcher";
import WeatherMapToday from "./components/weathermap";
import WeatherMapTomorrow from "./components/weathermaptomorrow";
import WeatherMapDayAfterTomorrow from "./components/weathermapdayaftertomorrow";
import FavoriteCities from "./components/favoriteCities";

export default function Home() {

  return (
    <>
      <div>
        <FavoriteCities />
      </div>
      <div className="flex flex-col xl:flex-row justify-center items-stretch md-plus:my-20 ">
        <div className="flex flex-col xl:flex-row mx-auto md-plus:gap-5">
          <div className="h-full">
            <WeatherMapSwitcher
              maps={{
                today: <WeatherMapToday />,
                tomorrow: <WeatherMapTomorrow />,
                dayaftertomorrow: <WeatherMapDayAfterTomorrow />,
              }}
            />
          </div>
          <div className="xl:h-full xl:w-auto">
            <Suspense fallback={<SkeletonWeatherReport />}>
              <WeatherReportGPT />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
