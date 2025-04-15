import type { Metadata } from "next";
import "./ui/globals.css";
import BackgroundWrapper from "./components/backgroundWarpper";
// import LayoutShell from "./layoutShell";
import NavBar from "./components/navbar";
import AppInitProvider from "./components/appInitProvider";
import RegisterSW from "@/app/components/registerSW";

export const metadata: Metadata = {
  title: "Weather App",
  description: "Get real-time weather updates and forecasts.",
  metadataBase: new URL("https://weather-app-nextjs.vercel.app"),
  openGraph: {
    title: "Weather App",
    description: "Get real-time weather updates and forecasts.",
    url: "https://weather-app-nextjs.vercel.app",
    siteName: "Weather App",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Weather App",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest?v=2" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem("theme");
                  if (
                    theme === "dark" ||
                    (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
                  ) {
                    document.documentElement.classList.add("dark");
                    document.documentElement.style.colorScheme = "dark";
                  } else {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.style.colorScheme = "light";
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* 2. Locale initializer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          try {
            const locale = localStorage.getItem('locale') || 'en';
            document.documentElement.setAttribute('lang', locale);
            window.__INITIAL_LOCALE__ = locale;
          } catch (_) {
            window.__INITIAL_LOCALE__ = 'en';
          }
        })();
      `,
          }}
        />
      </head>
      <body>
        <RegisterSW />
        <AppInitProvider>
          <NavBar />
          <BackgroundWrapper>{children}</BackgroundWrapper>
        </AppInitProvider>
      </body>
    </html>
  );
}
