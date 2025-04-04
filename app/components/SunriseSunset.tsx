import React from "react";
import { useTranslations } from "next-intl";

interface SunriseSunsetProps {
  sunrise: string | null;
  sunset: string | null;
}

export default function SunriseSunset({ sunrise, sunset }: SunriseSunsetProps) {
  const t = useTranslations("sunriseSunset");

  return (
    <div className="flex flex-row flex-wrap justify-center items-center gap-5">
      <span className="text-lg font-bold text-blue-950 dark:text-gray-100">
        {t("sunrise")} {sunrise}
      </span>
      <span className="text-lg font-bold  text-blue-950 dark:text-gray-100">
        {t("sunset")} {sunset}
      </span>
    </div>
  );
}
