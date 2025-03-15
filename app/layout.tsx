import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/navbar";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "./components/theme-provider";

export const metadata: Metadata = {
  title: "Weather App",
  description: "A simple weather app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
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
      </head>
      <body className="dark:bg-slate-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavBar />

          <div>{children}</div>
          <Analytics />
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
