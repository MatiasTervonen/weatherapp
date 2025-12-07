"use client";

import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "@/app/components/ThemeToggle";
import Image from "next/image";
import LocaleSwitcher from "@/app/components/localeSwitcher";
import InstallApp from "@/app/components/installApp";

type Theme = "light" | "dark";

export default function FooterMobile({
  initialTheme,
}: {
  initialTheme: Theme;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBackClick = () => {
    if (pathname === "/" || pathname === "") {
      //  Already on homepage — scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      //  On another route — navigate home
      router.push(`/`);
    }
  };

  if (pathname == "/radar") return null;

  return (
    <>
      <div className="w-full flex flex-col pt-5 pb-10  bg-blue-400 dark:bg-slate-950">
        <div className="flex justify-between items-center w-full px-5">
          <div className="ml-5 ">
            <button onClick={handleBackClick}>
              <Image src="/Back-Arrow.png" width={50} height={50} alt="Back" />
            </button>
          </div>
          <div className="mr-5 flex gap-5 items-center">
            <LocaleSwitcher />
            <ThemeToggle initialTheme={initialTheme} />
          </div>
        </div>

        <InstallApp />
      </div>
    </>
  );
}
