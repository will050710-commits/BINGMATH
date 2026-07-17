"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import katex from "katex";
import "katex/dist/katex.min.css";

const FORMULAS = [
  {
    title: "Đạo hàm của hàm hợp",
    titleEn: "Chain Rule for Derivatives",
    formula: "\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)",
    explain: "Đạo hàm của hàm hợp bằng đạo hàm của hàm ngoài nhân với đạo hàm của hàm trong.",
    bg: "linear-gradient(160deg, #0b1e36 0%, #030a16 100%)",
    accent: "#00d4ff",
    tip: "Thường dùng khi tính đạo hàm của u³ hoặc sin(2x+1)."
  },
  {
    title: "Tích phân từng phần",
    titleEn: "Integration by Parts",
    formula: "\\int u \\, dv = u v - \\int v \\, du",
    explain: "Mở rộng quy tắc đạo hàm của một tích. Thứ tự ưu tiên đặt u: 'Nhất lô, nhì đa, tam lượng, tứ mũ'.",
    bg: "linear-gradient(160deg, #1f1235 0%, #080315 100%)",
    accent: "#a78bfa",
    tip: "Nhớ vi phân dv để tìm v, và đạo hàm u để tìm du."
  },
  {
    title: "Thể tích khối chóp",
    titleEn: "Volume of a Pyramid",
    formula: "V = \\frac{1}{3} B \\cdot h",
    explain: "V là thể tích, B là diện tích đáy và h là chiều cao của khối chóp (khoảng cách từ đỉnh đến mặt đáy).",
    bg: "linear-gradient(160deg, #08241e 0%, #020c0a 100%)",
    accent: "#14b8a6",
    tip: "Hãy luôn xác định xem đáy là hình vuông, tam giác đều hay hình chữ nhật để tính B."
  },
  {
    title: "Định lý Cosin",
    titleEn: "Law of Cosines",
    formula: "a^2 = b^2 + c^2 - 2bc \\cos A",
    explain: "Dùng để tính cạnh còn lại của tam giác khi biết 2 cạnh và góc xen giữa, hoặc tính góc khi biết 3 cạnh.",
    bg: "linear-gradient(160deg, #2a1b0c 0%, #0d0803 100%)",
    accent: "#f59e0b",
    tip: "Khi góc A = 90 độ, định lý này trở thành định lý Pythagoras quen thuộc!"
  },
  {
    title: "Nguyên hàm của 1/x",
    titleEn: "Antiderivative of 1/x",
    formula: "\\int \\frac{1}{x} \\, dx = \\ln |x| + C",
    explain: "Nguyên hàm cơ bản quan trọng, lưu ý cần có dấu giá trị tuyệt đối vì x có thể âm.",
    bg: "linear-gradient(160deg, #240c1d 0%, #0c0209 100%)",
    accent: "#ec4899",
    tip: "Lưu ý tập xác định của Ln|x| là x khác 0."
  }
];

export default function ShortsPage() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll(".reel-item");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
            setActiveIndex(index);
            entry.target.classList.add("is-active");
          } else {
            entry.target.classList.remove("is-active");
          }
        });
      },
      {
        root: container,
        threshold: 0.55
      }
    );

    items.forEach((item) => io.observe(item));
    return () => io.disconnect();
  }, []);

  function renderFormula(formula) {
    try {
      const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
      return <div dangerouslySetInnerHTML={{ __html: html }} className="math-display" />;
    } catch {
      return <div className="math-fallback">{formula}</div>;
    }
  }

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", background: "#020c1b", position: "relative", color: "white", fontFamily: "sans-serif" }}>
      
      {/* Navbar overlay */}
      <header style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "linear-gradient(to bottom, rgba(2, 12, 27, 0.95) 0%, rgba(2, 12, 27, 0) 100%)",
        padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <Link href="/tailieu" style={{ textDecoration: "none", color: "white", display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
          ‹ Quay lại Tài liệu
        </Link>
        <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, background: "linear-gradient(135deg, #00d4ff, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Reels Công Thức
        </span>
        <div style={{ width: 60 }} /> {/* balance spacing */}
      </header>

      {/* Vertical Reels Container */}
      <div 
        ref={containerRef}
        className="reel-container"
        style={{
          width: "100%",
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {FORMULAS.map((f, i) => (
          <section
            key={i}
            className="reel-item"
            data-index={i}
            style={{
              width: "100%",
              height: "100vh",
              scrollSnapAlign: "start",
              background: f.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              padding: "0 24px",
              boxSizing: "border-box"
            }}
          >
            {/* Card Layout */}
            <div className="reel-card" style={{
              width: "100%",
              maxWidth: 420,
              background: "rgba(10, 22, 44, 0.65)",
              border: `1px solid ${f.accent}33`,
              borderRadius: 24,
              padding: 32,
              boxShadow: `0 24px 50px rgba(0,0,0,0.5), 0 0 30px ${f.accent}11`,
              backdropFilter: "blur(16px)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              boxSizing: "border-box",
              transform: activeIndex === i ? "scale(1)" : "scale(0.92)",
              opacity: activeIndex === i ? 1 : 0.4,
              transition: "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease"
            }}>
              {/* Badge */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <span style={{
                  fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8,
                  color: f.accent, background: `${f.accent}15`, border: `1px solid ${f.accent}35`,
                  borderRadius: 20, padding: "4px 12px"
                }}>
                  {f.titleEn}
                </span>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>{f.title}</h2>

              {/* LaTeX Formula block */}
              <div style={{
                background: "rgba(2, 8, 20, 0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "24px 16px",
                margin: "10px 0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.3)"
              }}>
                {renderFormula(f.formula)}
              </div>

              {/* Explanation */}
              <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 }}>
                {f.explain}
              </p>

              {/* Tip box */}
              <div style={{
                background: `${f.accent}0a`,
                borderLeft: `4px solid ${f.accent}`,
                padding: "12px 16px",
                borderRadius: "0 12px 12px 0",
                textAlign: "left",
                fontSize: 13,
                color: "#93c5fd"
              }}>
                💡 <strong>Mẹo:</strong> {f.tip}
              </div>
            </div>

            {/* Hint overlay at the bottom for Desktop users */}
            {i === 0 && (
              <div style={{
                position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                opacity: 0.7, animation: "badgeFloat 3s infinite ease-in-out"
              }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Cuộn xuống để xem thêm</span>
                <span style={{ fontSize: 16 }}>↓</span>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Side dot indicators */}
      <div style={{
        position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: 10, zIndex: 100
      }}>
        {FORMULAS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: activeIndex === i ? 24 : 8,
              borderRadius: 4,
              background: activeIndex === i ? FORMULAS[i].accent : "rgba(255,255,255,0.2)",
              transition: "all 0.3s ease",
              boxShadow: activeIndex === i ? `0 0 10px ${FORMULAS[i].accent}` : "none"
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        /* Hide scrollbars for Reels container */
        .reel-container::-webkit-scrollbar {
          display: none !important;
        }
        .reel-container {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        .math-display {
          color: white;
          font-size: 19px !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .math-fallback {
          font-family: monospace;
          color: #93c5fd;
          font-size: 16px;
        }
        
        @keyframes badgeFloat {
          0%, 100% { transform: translate(-50%, 0); }
          50%       { transform: translate(-50%, -6px); }
        }
      `}</style>
    </div>
  );
}
