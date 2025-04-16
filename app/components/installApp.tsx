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
        <div className="items-center border-2 p-2 ml-5 mb-5 rounded-xl inline-block w-fit bg-blue-950 hover:bg-blue-800 hover:scale-95">
          <div className="flex justify-between items-center gap-2">
            <button className="text-gray-100" onClick={handleInstallClick}>
              Install app
            </button>
            <Image src="/Mobile.png" width={30} height={30} alt="Install" />
          </div>
        </div>
      )}
    </>
  );
}
