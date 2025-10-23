import type { Metadata } from "next";
import React from "react";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"; // ✅ added this line

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Sales Monarchs System",
  description: "Click here to increase your sales now",
  generator: "SMM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans antialiased">
        {children}
        <Analytics /> {/* ✅ added this line */}
      </body>
    </html>
  );
}
