"use client";

import { useState, useEffect, useTransition } from "react";
import { locales } from "@/i18n/config";
import { useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  const [locale, setLocale] = useState("en")
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const storedLocale = localStorage.getItem("locale");
    if (storedLocale) {
      setLocale(storedLocale);
    }
  }, []);

  function onSelectChange(newLocale: string) {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    document.cookie = `locale=${newLocale}; path=/`; // 👈 set cookie
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div>
      <select
        name="locale"
        aria-label="Select language"
        className="border p-2 rounded bg-gray-100 dark:bg-gray-900 dark:text-gray-100 "
        value={locale}
        onChange={(e) => onSelectChange(e.target.value)}
        disabled={isPending}
      >
        {locales.map((locale) => (
          <option
            key={locale}
            value={locale}
            className="dark:bg-gray-900 dark:text-gray-100"
          >
            {locale.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
