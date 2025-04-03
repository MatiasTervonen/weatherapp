import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

const messagesMap = {
  en: () => import("../messages/en.json"),
  fin: () => import("../messages/fin.json"),
  // add more locales as needed
};

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await messagesMap[locale as keyof typeof messagesMap]()).default,
  };
});
