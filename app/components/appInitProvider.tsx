"use client";

import { TranslationProvider } from "./translationProvider";

type Locale = "en" | "fi";

export default function AppInitProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
      <TranslationProvider initialLocale={initialLocale}>
        {children}
      </TranslationProvider>
  );
}
