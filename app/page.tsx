export const revalidate = 0; // manually revalidated only

import FooterMobile from "./components/FooterMobile";
import WeatherReportGPT from "./components/weatherReportGPT";
import { SkeletonWeatherReport } from "./ui/skeleton";
import { Suspense } from "react";
import WeatherMapSwitcher from "./components/WeatherMapSwitcher";
import WeatherMapToday from "./components/weathermap";
import WeatherMapTomorrow from "./components/weathermaptomorrow";
import WeatherMapDayAfterTomorrow from "./components/weathermapdayaftertomorrow";
// import WeatherReport from "./weatherReport";

export default function Home() {
  console.log("Page rebuilt at", new Date().toISOString());

  return (
    <>
      <div className="flex flex-col xl:flex-row justify-center items-stretch md+:mt-20 ">
        <div className="flex flex-col xl:flex-row mx-auto md+:gap-5">
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
      <div className="flex sm:hidden">
        <FooterMobile />
      </div>
    </>
  );
}
