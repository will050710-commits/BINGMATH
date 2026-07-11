"use client";
import GlobalSidebar from "@/components/GlobalSidebar";
import PageTransition from "@/components/PageTransition/PageTransition";
import DuoTranslate from "@/components/DuoMCB/DuoTranslate";
import { usePathname } from "next/navigation";

function isLessonPath(pathname) {
  if (!pathname) return false;
  const path = pathname.toLowerCase();
  
  const staticLessons = [
    "/menh-de",
    "/tap-hop",
    "/phep-toan-tap-hop",
    "/bpt-bac-nhat-2-an",
    "/chuong2-10",
    "/ham-so-va-do-thi",
    "/ham-so-bac-hai",
    "/gia-tri-luong-giac",
    "/ontapchuong1",
    "/ontapchuong4"
  ];
  
  if (staticLessons.includes(path)) return true;
  if (path.startsWith("/lesson")) return true;
  if (path.startsWith("/l11-")) return true;
  if (path.startsWith("/l12-")) return true;
  
  return false;
}

export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const showTranslate = isLessonPath(pathname);

  return (
    <>
      <PageTransition>{children}</PageTransition>
      <GlobalSidebar />
      {showTranslate && <DuoTranslate />}
    </>
  );
}
