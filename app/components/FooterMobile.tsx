"use client";

import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import Link from "next/link";

export default function FooterMobile() {
  return (
    <>
      <div className="w-full flex justify-between items-center py-8  bg-blue-400 dark:bg-slate-950 ">
        <div className="ml-10 ">
          <Link href={`/`}>
            <Image src="/Back-Arrow.png" width={50} height={50} alt="Back" />
          </Link>
        </div>
        <div className="mr-10">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
