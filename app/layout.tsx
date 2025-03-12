import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/navbar";
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "Weather App",
  description: "A simple weather app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main>{children}</main>
        <Analytics/>
      </body>
    </html>
  );
}
