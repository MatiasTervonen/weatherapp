"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { TranslationProvider } from "./translationProvider";
import { Locale } from "moment-timezone";

export default function AppInitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialLocale, setInitialLocale] = useState<"en" | "fi" | null>(null);

  useEffect(() => {
    const locale = (window as any).__INITIAL_LOCALE__ || "en";
    setInitialLocale(locale);
  }, []);

  if (!initialLocale) return null;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TranslationProvider initialLocale={initialLocale}>
        {children}
      </TranslationProvider>
    </ThemeProvider>
  );
}
