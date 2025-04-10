import type { Metadata } from "next";
import "./ui/globals.css";
import BackgroundWrapper from "./components/backgroundWarpper";
// import LayoutShell from "./layoutShell";
import NavBar from "./components/navbar";
import AppInitProvider from "./components/appInitProvider";

export const metadata: Metadata = {
  title: "Weather App",
  description: "A simple weather app built with Next.js",
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
        <link rel="manifest" href="/site.webmanifest" />
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
        <AppInitProvider>
          <NavBar />
          <BackgroundWrapper>{children}</BackgroundWrapper>
        </AppInitProvider>
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
