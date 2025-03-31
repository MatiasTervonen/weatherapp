"use client";

import { ReactNode } from "react";
import Image from "next/image";

export default function BackgroundWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative w-full  min-h-screen overflow-hidden">
      <div className="absolute inset-0 hidden sm:block z-0">
        <Image
          src="/northern_lights_dark_upscaled.webp"
          alt="Background"
          fill
          priority
          className="object-cover z-0 transition-opacity duration-700 opacity-100"
          sizes="(min-width: 640px) 100vw"
        />
      </div>

      <div className="absolute inset-0 block sm:hidden z-0">
        <Image
          src="/northern_lights_dark_mobile.webp"
          alt="Background"
          fill
          priority
          className="object-cover z-0 transition-opacity duration-700 opacity-100"
          sizes="(max-width: 639px) 100vw"
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
