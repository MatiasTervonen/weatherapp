import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className=""
      >
        {theme === "dark" ? (
          <Image
            src="/Moon Symbol.svg"
            width={40}
            height={40}
            alt="Dark mode"
          />
        ) : (
          <Image src="/Sun.svg" width={40} height={40} alt="Dark mode" />
        )}
      </button>
    </>
  );
}
