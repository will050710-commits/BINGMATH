import { Be_Vietnam_Pro, Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
// Redesign Claude-style (Đợt 1): script pre-paint đặt <html data-theme> trước khi
// vẽ trang, tránh nháy sáng↔tối khi vào trang "paper" (marketing/đọc bài).
import { buildThemeBootstrapScript } from "@/lib/themeRoutes";
import "./globals.css";
// Phase 4 / Đợt 4H — Mafs ships a global stylesheet. The App Router only allows
// global CSS imports in the root layout (a component-level import would fail the
// build), so it is imported here and the widget stays a plain client component.
import "mafs/core.css";
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

// Redesign Claude-style (Đợt 1) — Source Serif 4 thay cho "Anthropic Serif"
// (KHÔNG dùng Instrument Serif: font đó thiếu subset vietnamese, dấu tiếng Việt
// sẽ vỡ). JetBrains Mono cho công thức/code. Cả hai self-host qua next/font,
// không đổi CSP và không thêm request ra ngoài.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "BingMath — Học Toán Song Ngữ",
  description: "Nền tảng học toán song ngữ Anh-Việt cho học sinh chuyên STEM. Đề thi thử SAT & IELTS, mini-games, đấu hạng realtime và AI chatbot toán học.",
  keywords: ["toán học", "song ngữ", "STEM", "SAT", "IELTS", "học sinh", "lớp 10", "lớp 11", "lớp 12"],
  authors: [{ name: "BingMath Team" }],
  creator: "BingMath",
  publisher: "BingMath",
  applicationName: "BingMath",
  // PWA manifest
  manifest: "/manifest.json",
  // Apple PWA meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BingMath",
  },
  // Open Graph for social sharing
  openGraph: {
    title: "BingMath — Học Toán Song Ngữ",
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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
    { media: "(prefers-color-scheme: light)", color: "#f5f4ed" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body
        suppressHydrationWarning={true}
        className={`${beVietnamPro.variable} ${inter.variable} ${sourceSerif.variable} ${jetBrainsMono.variable} antialiased`}
      >
        {/* Redesign Claude-style (Đợt 1) — đặt <html data-theme> TRƯỚC khi paint
            để trang "paper" không nháy tối→sáng. Script chỉ đọc pathname +
            localStorage, không nhận dữ liệu người dùng; CSP hiện cho phép
            script-src 'unsafe-inline' (xem next.config.mjs). */}
        <script dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }} />
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
