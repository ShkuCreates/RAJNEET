import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["700", "800", "900"]
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"]
});

const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"]
});

export const metadata: Metadata = {
  title: "RAJNEET - Your Voice. Your Democracy.",
  description: "India's Civic Debate Platform. Protected under Article 19(1)(a) of the Indian Constitution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${spaceMono.variable} dark`}>
      <body className="min-h-screen bg-navy-primary font-body antialiased">
        <NextAuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
