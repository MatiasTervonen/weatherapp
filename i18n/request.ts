import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { getValidLocale } from "@/i18n/config";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const cookieLocale = (await cookies()).get("locale")?.value;

  const locale = getValidLocale(cookieLocale);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
