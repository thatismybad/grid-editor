import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { appVersion } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grid Editor",
  description: "A tool for creating and editing grid-based images.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Grid Editor",
    description: "A tool for creating and editing grid-based images.",
    url: "https://grid-editor.vercel.app/",
    siteName: "Grid Editor",
    images: [
      {
        url: "/logo.png",
        width: 731,
        height: 731,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="text-center text-sm text-gray-500 p-4">
          {appVersion}
        </footer>
      </body>
    </html>
  );
}
