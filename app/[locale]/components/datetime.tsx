"use client";

import { useState, useEffect } from "react";

export default function DateTimeDisplay() {
  const [dateTime, setDateTime] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      setDateTime(
        new Date().toLocaleString("en-GB", {
          weekday: "short",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23", // Forces 24-hour format
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 100000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>{dateTime}</p>
    </div>
  );
}
