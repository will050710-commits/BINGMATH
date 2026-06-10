import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@heroui/react";
import HeroProvider from "../../HeroProvider";
import { AuthProvider } from "@/context/authContext";
import { MathMapStoreProvider } from "@/context/MathMapStore";
import LayoutClient from "@/components/LayoutClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DuoMath",
  description: "Bilingual Math Learning Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeroProvider>
          <AuthProvider>
            <MathMapStoreProvider>
              <LayoutClient>{children}</LayoutClient>
            </MathMapStoreProvider>
          </AuthProvider>
        </HeroProvider>
      </body>
    </html>
  );
}
