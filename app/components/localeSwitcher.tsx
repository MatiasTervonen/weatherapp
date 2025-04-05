"use client";

import { useTranslationContext } from "./translationProvider";

export default function LocaleSwitcher() {
  const { locale, setLocale } = useTranslationContext();

  return (
    <select
      name="locale"
      aria-label="Language selector"
      value={locale}
      onChange={(e) => setLocale(e.target.value as "en" | "fi")}
      className="border p-2 rounded bg-gray-100 dark:bg-gray-900 dark:text-gray-100"
    >
      <option value="en">EN</option>
      <option value="fi">FI</option>
    </select>
  );
}
