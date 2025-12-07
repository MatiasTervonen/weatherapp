"use client";

import Image from "next/image";
import { useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle({ initialTheme }: { initialTheme: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";

    setTheme(next);

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);

    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  if (!theme) return null;

  return (
    <>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="hover:scale-105 transition-transform duration-200"
      >
        {theme === "dark" ? (
          <Image
            src="/Moon_Symbol_40x40.webp"
            width={40}
            height={40}
            alt="Dark mode"
            priority
          />
        ) : (
          <Image
            src="/Sun_40x40.webp"
            width={40}
            height={40}
            alt="Light mode"
            priority
          />
        )}
      </button>
    </>
  );
}
