"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const locales = ["en", "fin"];

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPathname = segments.join("/");

    startTransition(() => {
      router.push(newPathname);
    });
  }

  return (
    <select
      className="border p-2 rounded bg-gray-100 dark:bg-gray-900 dark:text-gray-100 "
      defaultValue={pathname.split("/")[1]}
      onChange={(e) => onSelectChange(e.target.value)}
      disabled={isPending}
    >
      {locales.map((locale) => (
        <option key={locale} value={locale} className="dark:bg-gray-900 dark:text-gray-100">
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
