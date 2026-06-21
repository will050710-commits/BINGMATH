"use client";
import GlobalSidebar from "@/components/GlobalSidebar";
import PageTransition from "@/components/PageTransition/PageTransition";

export default function LayoutClient({ children }) {
  return (
    <>
      <PageTransition>{children}</PageTransition>
      <GlobalSidebar />
    </>
  );
}
