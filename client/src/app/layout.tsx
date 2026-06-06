import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Health Boot — Cinematic AI-Powered Wellness Terminal",
  description: "Sync your biometrics from the Health Boot kiosk, track daily calorie intake, log smart goals, and get personalized clinical AI health insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <Link
          href="/chat"
          className="
            fixed
            bottom-4 right-4
            md:bottom-6 md:right-6
            z-50
            rounded-full
            bg-slate-900
            px-4 py-3
            md:px-5 md:py-4
            text-sm md:text-base
            font-semibold
            text-white
            shadow-lg
            hover:shadow-cyan-glow
            hover:scale-[1.05]
            hover:bg-slate-800
            transition-all
            duration-300"
        >
          Chat with Health Boot
        </Link>

        <main className="w-full min-h-screen">
          {children}
        </main>
        
        {/* Global Footer */}
        <footer className="w-full text-center py-6 text-xs text-slate-500/60 mt-auto bg-transparent border-t border-slate-200/5">
          Coded by Kavinila and Arunaw Rishe M...
        </footer>
      </body>
    </html>
  );
}
