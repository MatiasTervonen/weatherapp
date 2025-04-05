"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { TranslationProvider } from "./translationProvider";

declare global {
  interface Window {
    __INITIAL_LOCALE__?: "en" | "fi";
  }
}

export default function AppInitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialLocale, setInitialLocale] = useState<"en" | "fi" | null>(null);

  useEffect(() => {
    const locale = window.__INITIAL_LOCALE__ || "en";
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
