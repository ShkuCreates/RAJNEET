import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["700", "800", "900"],
  style: ["italic", "normal"]
});

const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"]
});

const bebas = Bebas_Neue({ 
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: ["400"]
});

export const metadata: Metadata = {
  title: "RAJNEET - Political News & Debate",
  description: "India's Structured Political Debate Platform. Protected under Article 19(1)(a) of the Indian Constitution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jetbrains.variable} ${bebas.variable} dark`}>
      <body className="min-h-screen bg-dark-black font-mono antialiased">
        <div className="noise-overlay" />
        <div className="scanlines" />
        <NextAuthProvider>
          {children}
          <Toaster richColors position="top-center" theme="dark" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
