"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string; platform: string }>;
}

export default function InstallApp() {
  const [deferredPromt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      console.log("Before install prompt available");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPromt) {
      deferredPromt.prompt();
      const result = await deferredPromt.userChoice;
      console.log("User choice", result.outcome);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {deferredPromt && (
        <button
          className="text-gray-100 flex w-fit border p-2 ml-5 my-5 rounded-xl bg-blue-950 hover:bg-blue-900 hover:scale-95"
          onClick={handleInstallClick}
        >
          <div className="flex gap-2 items-center">
            <p>Install app</p>
            <Image src="/Mobile.png" width={30} height={30} alt="Install" />
          </div>
        </button>
      )}
    </>
  );
}
