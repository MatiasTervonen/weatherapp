export const locales = ["en", "fi"] as const; // Define the supported locales
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

export function getValidLocale(locale: string | undefined | null): Locale {
    return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  }