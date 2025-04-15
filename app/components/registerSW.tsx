"use client";

import { useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) =>
          console.log("Service Worker registered successfully:", reg)
        )
        .catch((err) =>
          console.error("Service Worker registration failed:", err)
        );
    }

    window.addEventListener("beforeinstallprompt", (e: Event) => {
      e.preventDefault();

      const promptEvent = e as BeforeInstallPromptEvent;

      window.deferredPrompt = promptEvent;

      promptEvent.prompt(); 
    });
  }, []);

  return null;
}
