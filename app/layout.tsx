import type { Metadata } from "next";
import "./ui/globals.css";
import BackgroundWrapper from "./components/backgroundWarpper";
// import LayoutShell from "./layoutShell";
import NavBar from "./components/navbar";
import AppInitProvider from "./components/appInitProvider";
import FooterMobile from "./components/FooterMobile";
import { cookies } from "next/headers";

type Locale = "en" | "fi";
type Theme = "light" | "dark";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const locale = cookieStore.get("locale")?.value;
  const initialLocale: Locale = locale === "fi" ? "fi" : "en";

  const theme = cookieStore.get("theme")?.value;
  const initialTheme: Theme = theme === "light" ? "light" : "dark";

  return (
    <html lang="en" className={initialTheme}>
      <body className="bg-slate-950">
        <AppInitProvider initialLocale={initialLocale}>
          <NavBar initialTheme={initialTheme} />
          <BackgroundWrapper>{children}</BackgroundWrapper>
          <div className="flex sm:hidden">
            <FooterMobile initialTheme={initialTheme} />
          </div>
        </AppInitProvider>
      </body>
    </html>
  );
}
