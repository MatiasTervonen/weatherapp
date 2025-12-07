"use client";

import Link from "next/link";
import { useTranslation } from "@/app/lib/useTranslation";

export default function NotFound() {
  const { t } = useTranslation("NotFound");

  return (
    <div className="flex justify-center items-center mx-auto min-h-[calc(100vh-136px)]  sm:min-h-[calc(100vh-188px)]">
      <div className="flex flex-col justify-center text-center gap-4 md:gap-8 p-5 md:p-10 rounded-xl bg-blue-400 dark:bg-slate-950">
        <h2 className="text-md md:text-xl lg:text-2xl">{t("404")}</h2>
        <p className="text-md md:text-xl lg:text-2xl">{t("NotFoundText")}</p>
        <Link
          href={"/"}
          className="rounded-md bg-blue-600 px-4 py-2  hover:bg-blue-500 hover:scale-105 text-md md:text-xl lg:text-2xl border-2 border-gray-100"
        >
          {t("GoBack")}
        </Link>
      </div>
    </div>
  );
}
