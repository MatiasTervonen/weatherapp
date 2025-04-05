import type { Metadata } from "next";
import "./ui/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "./components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import BackgroundWrapper from "./components/backgroundWarpper";
// import LayoutShell from "./layoutShell";
import NavBar from "./components/navbar";
import LayoutShell from "./layoutShell";
import { TranslationProvider } from "@/app/components/translationProvider";

export const metadata: Metadata = {
  title: "Weather App",
  description: "A simple weather app built with Next.js",
};

export default async function RootLayout({
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
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL}
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem("theme");
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
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={true}
        >
          <LayoutShell>
            <TranslationProvider>
              <NavBar />
              <BackgroundWrapper>{children}</BackgroundWrapper>
            </TranslationProvider>
          </LayoutShell>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function() {
        console.log('Checking for service worker support...');
        if ('serviceWorker' in navigator) {
          console.log('Service worker supported. Attempting to register...');
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
              .then(reg => console.log('Service Worker registered successfully:', reg))
              .catch(err => console.error('Service Worker registration failed:', err));
          });
        } else {
          console.log('Service workers are not supported in this browser.');
        }
      })();
    `,
          }}
        />
      </body>
    </html>
  );
}
