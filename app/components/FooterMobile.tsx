"use client";

import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "@/app/components/ThemeToggle";
import Image from "next/image";
import LocaleSwitcher from "@/app/components/localeSwitcher";

export default function FooterMobile() {
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

  return (
    <>
      <div className="w-full flex justify-between items-center py-8  bg-blue-400 dark:bg-slate-950 ">
        <div className="ml-10 ">
          <button onClick={handleBackClick}>
            <Image src="/Back-Arrow.png" width={50} height={50} alt="Back" />
          </button>
        </div>
        <div className="mr-10 flex gap-5 items-center">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
