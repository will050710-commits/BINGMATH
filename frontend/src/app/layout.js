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
  title: "DuoMath — Học Toán Song Ngữ",
  description: "Nền tảng học toán song ngữ Anh-Việt cho học sinh chuyên STEM. Đề thi thử SAT & IELTS, mini-games, đấu hạng realtime và AI chatbot toán học.",
  keywords: ["toán học", "song ngữ", "STEM", "SAT", "IELTS", "học sinh", "lớp 10", "lớp 11", "lớp 12"],
  authors: [{ name: "DuoMath Team" }],
  creator: "DuoMath",
  publisher: "DuoMath",
  applicationName: "DuoMath",
  // PWA manifest
  manifest: "/manifest.json",
  // Apple PWA meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DuoMath",
  },
  // Open Graph for social sharing
  openGraph: {
    title: "DuoMath — Học Toán Song Ngữ",
    description: "Học toán STEM song ngữ Anh-Việt, luyện SAT & IELTS cùng AI",
    type: "website",
    locale: "vi_VN",
  },
  // Icons
  icons: {
    icon: "/images/duosteamicon-removebg-preview.webp",
    apple: "/images/duosteamicon-removebg-preview.webp",
    shortcut: "/images/duosteamicon-removebg-preview.webp",
  },
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020c1b" },
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
  ],
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
