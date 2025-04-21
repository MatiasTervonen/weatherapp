import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Weather Channel",
    short_name: "Weather",
    description: "Get real-time weather updates and forecasts.",
    theme_color: "#0f172a",
    background_color: "#0f172a",
    display: "standalone",
    start_url: "/",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
    ],
    screenshots: [
      {
        src: "/Screenshot-weather-app.jpg",
        sizes: "576x1039",
        type: "image/png",
        label: "Home screen with current weather",
      },
    ],
  };
}
