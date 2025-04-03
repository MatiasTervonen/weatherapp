import FooterMobile from "./components/FooterMobile";
import WeatherReportGPT from "../components/weatherReportGPT";
import { SkeletonWeatherReport } from "../ui/skeleton";
import { Suspense } from "react";
import WeatherMapSwitcher from "./components/WeatherMapSwitcher";
import WeatherMapToday from "../components/weathermap";
import WeatherMapTomorrow from "../components/weathermaptomorrow";
import WeatherMapDayAfterTomorrow from "../components/weathermapdayaftertomorrow";
// import WeatherReport from "./weatherReport";

export default function Home() {
  return (
    <>
      <div className="flex min-h-764px flex-col xl:flex-row justify-center items-stretch md+:mt-10 xl:mt-20 xl:h-[764px]">
        <div className="flex flex-col max-w-[818px] xl:max-w-[1286px] xl:flex-row mx-auto md+:gap-5">
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
