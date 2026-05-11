import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import Script from "next/script";

const sora = Sora({ 
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"]
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "RAJNEET - Your Voice. Your Democracy.",
  description: "India's Civic Tech Platform. Read real news, debate your stance, and hold power accountable.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "RAJNEET - Your Voice. Your Democracy.",
    description: "India's Civic Tech Platform. Read real news, debate your stance, and hold power accountable.",
    url: "https://rajneet.co.in",
    siteName: "RAJNEET",
    images: [
      {
        url: "https://rajneet.co.in/favicon.ico",
        width: 512,
        height: 512,
        alt: "RAJNEET - India's Political Debate Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} dark`}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4497767570737848"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen bg-midnight font-body antialiased">
        <NextAuthProvider>
          {children}
          <Toaster richColors position="top-center" theme="dark" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
