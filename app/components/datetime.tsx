"use client";

import { useState, useEffect } from "react";
import { useTranslationContext } from "./translationProvider";

export default function DateTimeDisplay() {
  const [dateTime, setDateTime] = useState<string>("");

  const { locale } = useTranslationContext();

  useEffect(() => {
    const updateDateTime = () => {
      setDateTime(
        new Date().toLocaleString(locale, {
          weekday: "short",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23", // Forces 24-hour format
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 100000);

    return () => clearInterval(interval);
  }, [locale]);

  return (
    <div>
      <p>{dateTime}</p>
    </div>
  );
}
