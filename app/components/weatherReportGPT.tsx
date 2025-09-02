import { getWeatherFromDB } from "@/app/lib/getWeatherFromDB";
import WeatherHighlights from "./weatherHighlights";

export default async function WeatherReportGPT() {
  const { report, created_at, error } = await getWeatherFromDB();

  const createdAt = created_at
    ? new Date(created_at).toLocaleString("fi-FI", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Helsinki",
      })
    : null;

  return (
    <>
      <div className="xl:w-[28rem] md-plus:w-[760px] h-full bg-blue-200 md-plus:rounded-xl p-8 pb-10 border-b-2  md-plus:border-2 border-gray-100 dark:bg-slate-950 dark:text-gray-100">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-10 my-5 text-center">
            <h2 className="text-xl text-gray-800  dark:text-gray-100 font-bold">
              Weather Report Today
            </h2>
            {error && <p className="text-sm text-gray-500 mt-20">{error}</p>}

            {createdAt && (
              <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">
                {createdAt}
              </p>
            )}
          </div>

          {report && (
            <p className="text-lg text-gray-800 dark:text-gray-100">{report}</p>
          )}
        </div>
        <WeatherHighlights />
      </div>
    </>
  );
}
