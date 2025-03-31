// "use client";

// import useSWR from "swr";
// import { WeatherData } from "@/types/weather";

// export default function WeatherReport() {




//   return (
//     <>
//       <div className="flex justify-center items-center">
//         <div className="bg-blue-200 rounded-xl border-2 ml-5 p-10 dark:bg-slate-950">

//           {hottestLocation.loc ? (
//             <p className="mb-2 dark:text-gray-100">
//               The hottest temperature is in {hottestLocation.loc} at{" "}
//               {hottestLocation.temp}°C
//             </p>
//           ) : (
//             <p>No temperature available</p>
//           )}
//           {coldestLocation.loc ? (
//             <p className="mb-2 dark:text-gray-100">
//               The coldest weather is in {coldestLocation.loc} at{" "}
//               {coldestLocation.temp}°C
//             </p>
//           ) : (
//             <p>No temperature available</p>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
