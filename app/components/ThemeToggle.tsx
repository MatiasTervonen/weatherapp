import { useTheme } from "next-themes";
import Image from "next/image";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
        className="transition hover:scale-105"
      >
        {resolvedTheme === "dark" ? (
          <Image
            src="/Moon_Symbol_40x40.webp"
            width={40}
            height={40}
            alt="Dark mode"
            priority
          />
        ) : (
          <Image src="/Sun_40x40.webp" width={40} height={40} alt="Dark mode" />
        )}
      </button>
    </>
  );
}
