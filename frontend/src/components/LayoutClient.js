"use client";
import GlobalSidebar from "@/components/GlobalSidebar";
import PageTransition from "@/components/PageTransition/PageTransition";
import StreakBar from "@/components/StreakBar";

export default function LayoutClient({ children }) {
  return (
    <>
      <PageTransition>{children}</PageTransition>
      {/* StreakBar — luôn hiển thị góc trên phải, click → /stats */}
      <div style={{
        position: "fixed", top: 12, right: 80,
        zIndex: 100, pointerEvents: "auto",
      }}>
        <StreakBar />
      </div>
      <GlobalSidebar />
    </>
  );
}
