"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/messages/en.json";
import fi from "@/messages/fi.json";

const messagesMap = { en, fi };

type Locale = "en" | "fi";
type Messages = typeof en;

interface TranslationContextType {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  locale: "en",
  messages: en,
  setLocale: (locale: string) => locale,
});

export const useTranslationContext = () => useContext(TranslationContext);

export function TranslationProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const messages = messagesMap[locale];

  useEffect(() => {
    document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  return (
    <TranslationContext.Provider value={{ locale, messages, setLocale }}>
      {children}
    </TranslationContext.Provider>
  );
}
