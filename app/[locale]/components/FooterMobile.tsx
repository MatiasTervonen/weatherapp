"use client";

import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import Link from "next/link";
import LocaleSwitcher from "./localeSwitcher";

export default function FooterMobile() {
  return (
    <>
      <div className="w-full flex justify-between items-center py-8  bg-blue-400 dark:bg-slate-950 ">
        <div className="ml-10 ">
          <Link href={`/`}>
            <Image src="/Back-Arrow.png" width={50} height={50} alt="Back" />
          </Link>
        </div>
        <div className="mr-10 flex gap-5 items-center">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
