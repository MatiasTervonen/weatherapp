"use client";

import { TranslationProvider } from "./translationProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

type Locale = "en" | "fi";

export default function AppInitProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <TranslationProvider initialLocale={initialLocale}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TranslationProvider>
  );
}
