import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/navbar";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Weather App",
  description: "A simple weather app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <Head>
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
      </Head>
      <body>
        <NavBar />
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
