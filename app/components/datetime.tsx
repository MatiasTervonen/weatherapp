"use client";

import { useState, useEffect } from "react";

export default function DateTimeDisplay() {
  const [dateTime, setDateTime] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      setDateTime(new Date().toLocaleString());
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
