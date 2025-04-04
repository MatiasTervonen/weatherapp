import type { Metadata } from "next";
import "./ui/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "./components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import BackgroundWrapper from "./components/backgroundWarpper";
// import LayoutShell from "./layoutShell";
import NavBar from "./components/navbar";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Weather App",
  description: "A simple weather app built with Next.js",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

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
          rel="alternate"
          hrefLang="en"
          href="https://weatherapp-chi-neon.vercel.app/en"
        />
        <link
          rel="alternate"
          hrefLang="fi"
          href="https://weatherapp-chi-neon.vercel.app/fi"
        />
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
          {/* <LayoutShell> */}
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NavBar />
            <BackgroundWrapper>{children}</BackgroundWrapper>
          </NextIntlClientProvider>
          {/* </LayoutShell> */}
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
