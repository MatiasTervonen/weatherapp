"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string; platform: string }>;
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

function isIosSafari(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(userAgent);
  const isSafari =
    /safari/.test(userAgent) && !/crios|fxios|chrome|edge/.test(userAgent);
  return isIos && isSafari;
}

function isInStandaloneMode(): boolean {
  return (
    "standalone" in navigator &&
    (navigator as NavigatorStandalone).standalone === true
  );
}

export default function InstallApp() {
  const [deferredPromt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIosSafari() && isInStandaloneMode()) {
      setShowIosPrompt(true);
    }

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

      {showIosPrompt && (
        <div className="text-gray-100 flex-col w-fit border p-2 ml-5 my-5 rounded-xl bg-blue-950 hover:bg-blue-900 hover:scale-95">
          <div className="flex gap-2 items-center mb-2">
            <p>Install app</p>
            <Image src="/Mobile.png" width={30} height={30} alt="Install" />
          </div>
          <div className="flex flex-col">
            <p>
              Tap the <span>Share</span> button in Safari, then choose
            </p>
            <span>&quot;Add to Home Screen&quot;</span>
          </div>
        </div>
      )}
    </>
  );
}
