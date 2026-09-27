"use client";

// Phase 4 (integration guide item 2.5) — the Mafs prototype page.
//
// Mafs measures the DOM, so the widget must load client-side only; in the App
// Router that means a client component using next/dynamic with `ssr: false`
// (this page). Everything else here is plain markup, so the page itself stays
// cheap and the gate scripts can parse it.

import dynamic from "next/dynamic";
import Link from "next/link";

const ParabolaExplorer = dynamic(() => import("@/components/duomath/ParabolaExplorer"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 18, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
      Đang tải đồ thị tương tác…
    </div>
  ),
});

export default function ExplorePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#05070f", color: "#e2e8f0", padding: "40px 18px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>📈 Khám phá đồ thị</h1>
          <div style={{ display: "flex", gap: 14, fontSize: 13 }}>
            <Link href="/relearn" style={{ color: "#67e8f9" }}>🔁 Ôn tập</Link>
            <Link href="/ketqua" style={{ color: "#67e8f9" }}>Kết quả</Link>
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>
          Kéo ba thanh trượt <b>a</b>, <b>b</b>, <b>c</b> để xem parabol thay đổi. Đỉnh, trục đối xứng và số nghiệm
          được tính ngay tại đây bằng cùng công thức mà trợ lý dùng khi giải bài (SymPy trên máy chủ) — đây là
          bản mô phỏng trực quan của đúng phép tính đó.
        </p>

        <div style={{ marginTop: 18 }}>
          <ParabolaExplorer />
        </div>

        <div style={{ marginTop: 18, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
          <div>💡 <b>Gợi ý học tập:</b></div>
          <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
            <li>Giữ <b>a &gt; 0</b> rồi đổi dấu thành <b>a &lt; 0</b> — bề lõm đổi hướng thế nào?</li>
            <li>Đặt <b>Δ = 0</b> (đỉnh chạm trục hoành) — em đọc được gì về số nghiệm?</li>
            <li>Cho <b>a = 0</b> — vì sao lúc đó không còn là hàm bậc hai?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
