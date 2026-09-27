"use client";

// Phase 4 — offline fallback page. The service worker (public/sw.js) serves this
// when a navigation fails and nothing is cached. It is deliberately dependency
// free and explains which parts of the app keep working offline.

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#05070f", color: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 18px" }}>
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontSize: 44 }}>📶</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "10px 0 6px" }}>Em đang ngoại tuyến</h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.7 }}>
          Trang này cần mạng. Khi có kết nối lại, em có thể tiếp tục luyện tập, xem nhận xét và mở
          “🔁 Ôn tập hôm nay”. Các trang đã xem trước đó vẫn mở được từ bộ nhớ đệm của thiết bị.
        </p>
        <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.35)", color: "#67e8f9", textDecoration: "none" }}>
            ← Về trang chủ
          </Link>
          <Link href="/relearn" style={{ padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>
            🔁 Ôn tập hôm nay
          </Link>
        </div>
      </div>
    </div>
  );
}
