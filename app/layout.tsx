import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";

const cinzel = Cinzel({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RAJNEET — Where Influence is Power",
  description: "A browser-based political social simulation platform",
  icons: {
    icon: "/images/rajneet-logo.png",
    apple: "/images/rajneet-logo.png",
  },
  openGraph: {
    title: "RAJNEET — Where Influence is Power",
    description: "A browser-based political social simulation platform",
    images: [{ url: "/images/rajneet-logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${inter.variable}`}>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
