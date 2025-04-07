import Loading from "./loading";
import { Suspense } from "react";

export default function WeatherCityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
