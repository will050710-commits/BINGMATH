import { Be_Vietnam_Pro, Inter } from "next/font/google";
import "./globals.css";
import "@heroui/react";
import HeroProvider from "../../HeroProvider";
import { AuthProvider } from "@/context/authContext";
import { MathMapStoreProvider } from "@/context/MathMapStore";
import LayoutClient from "@/components/LayoutClient";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "DuoMath",
  description: "Bilingual Math Learning Platform",
  themeColor: "#020c1b",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${beVietnamPro.variable} ${inter.variable} antialiased`}
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
