import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAJNEET - Your Voice. Your Democracy.",
  description: "Protected under Article 19(1)(a) of the Indian Constitution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <NextAuthProvider>
          {children}
          <Toaster richColors position="top-center" />
        </NextAuthProvider>
      </body>
    </html>
  );
}
