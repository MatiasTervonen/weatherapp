"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return isLoading ? (
    <div className="inset-0 fixed flex flex-col items-center justify-center gap-5">
      <Image
        src="/android-chrome-512x512.png"
        alt="Logo"
        width={100}
        height={100}
        className="animate-bounce"
      />
      <div className="splash-screen animate-pulse font-bold text-2xl">
        Loading Weather app...
      </div>
    </div>
  ) : (
    children
  );
}
