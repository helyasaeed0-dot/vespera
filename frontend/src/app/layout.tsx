import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Vespera Enterprise & Vespera Mart | E-Commerce & Strategic Partnerships",
  description: "Vespera integrates multi-category retail excellence with high-impact institutional partnerships, cross-border supply chains, and workforce creation.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

import { Suspense } from "react";
import AuthModal from "@/components/auth/AuthModal";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
      </body>
    </html>
  );
}
