import { getWeatherFromDB } from "../lib/getWeatherFromDB";
import WeatherHighlights from "./weatherHighlights";

export default async function WeatherReportGPT() {
  try {
    const { report, created_at } = await getWeatherFromDB();

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

        if (!report) {
          return (
            <div className="xl:w-[28rem] h-full bg-blue-200 md+:rounded-xl p-5 pb-10 border-b-2  md+:border-2 border-gray-100 dark:bg-slate-950 dark:text-gray-100">
              <div className="flex flex-col items-center mb-10">
                <h2 className="text-xl text-gray-600  dark:text-gray-100 font-bold mb-10 my-5">
                  Weather Report Today
                </h2>
                <p className="text-red-500"> No weather report available</p>
              </div>
            </div>
          );
        }


    return (
      <>
        <div className="xl:w-[28rem] h-full bg-blue-200 md+:rounded-xl p-5 pb-10 border-b-2  md+:border-2 border-gray-100 dark:bg-slate-950 dark:text-gray-100">
          <div className="flex flex-col items-center mb-10">
            <div className="mb-10 my-5 text-center">
              <h2 className="text-xl text-gray-600  dark:text-gray-100 font-bold">
                Weather Report Today
              </h2>
              {createdAt && (
                <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">
                  {createdAt}
                </p>
              )}
            </div>
            <p className="text-lg">{report}</p>
          </div>
          <WeatherHighlights />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching weather report:", error);
    return (
      <div className="xl:w-[28rem] h-full bg-blue-200 md+:rounded-xl p-5 pb-10 border-b-2  md+:border-2 border-gray-100 dark:bg-slate-950 dark:text-gray-100">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-xl text-gray-600  dark:text-gray-100 font-bold mb-10 my-5">
            Weather Report Today
          </h2>
          <p className="text-red-500"> No weather report available</p>
        </div>
      </div>
    );
  }
}
