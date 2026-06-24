"use client";

import { useState } from "react";

const TOOLS = [
  {
    id: "graphing",
    label: "Đồ thị",
    title: "Graphing Calculator",
    src: "https://www.geogebra.org/classic?embed&p=g",
  },
  {
    id: "geometry",
    label: "Hình học",
    title: "Geometry",
    src: "https://www.geogebra.org/classic?embed&p=geometry",
  },
  {
    id: "classic",
    label: "Tổng hợp",
    title: "Classic Geometry and Algebra",
    src: "https://www.geogebra.org/classic?embed",
  },
  {
    id: "threeD",
    label: "3D / Vectơ",
    title: "3D Calculator",
    src: "https://www.geogebra.org/classic?embed&p=3d",
  },
  {
    id: "cas",
    label: "CAS",
    title: "Computer Algebra System",
    src: "https://www.geogebra.org/classic?embed&p=cas",
  },
  {
    id: "probability",
    label: "Xác suất",
    title: "Probability Calculator",
    src: "https://www.geogebra.org/classic?embed&p=probability",
  },
];

export default function MathToolsPanel({ lang = "vi" }) {
  const [open, setOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(TOOLS[0].id);
  const [hovered, setHovered] = useState(false);
  const t = (vi, en) => (lang === "vi" ? vi : en);
  const selectedTool = TOOLS.find((tool) => tool.id === activeTool) || TOOLS[0];

  const S = {
    trigger: {
      position: "fixed",
      bottom: 24,
      right: 92,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #06b6d4, #0891b2)",
      color: "white",
      border: "none",
      width: 56,
      height: 56,
      borderRadius: "50%",
      fontSize: 22,
      cursor: "pointer",
      boxShadow: hovered
        ? "0 8px 32px rgba(6,182,212,0.65), 0 0 0 5px rgba(6,182,212,0.2)"
        : "0 4px 24px rgba(6,182,212,0.5), 0 0 0 3px rgba(6,182,212,0.15)",
      transform: hovered ? "translateY(-4px) scale(1.08)" : "translateY(0) scale(1)",
      transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, background 0.2s",
    },
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.35)",
      zIndex: 10002,
      backdropFilter: "blur(2px)",
    },
    panel: {
      position: "fixed",
      top: 0,
      right: 0,
      width: "min(860px, 96vw)",
      height: "100vh",
      background: "#ffffff",
      zIndex: 10003,
      boxShadow: "-10px 0 44px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "16px 18px",
      borderBottom: "1px solid #e6eef0",
      background: "#22d3ee",
      color: "white",
    },
    title: {
      fontSize: 18,
      fontWeight: 800,
    },
    close: {
      width: 36,
      height: 36,
      border: "none",
      borderRadius: 8,
      background: "rgba(255,255,255,0.16)",
      color: "white",
      cursor: "pointer",
      fontSize: 18,
      lineHeight: 1,
    },
    tabs: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      padding: "12px 16px",
      borderBottom: "1px solid #e6eef0",
      background: "#f7fbfc",
    },
    tab: (active) => ({
      border: `1px solid ${active ? "#22d3ee" : "#ccdadd"}`,
      borderRadius: 8,
      background: active ? "#22d3ee" : "white",
      color: active ? "white" : "#244248",
      padding: "9px 14px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      whiteSpace: "nowrap",
    }),
    frameWrap: {
      flex: 1,
      minHeight: 0,
      background: "#eef5f7",
    },
    frame: {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block",
      background: "rgba(255, 255, 255, 0.04)",
    },
  };

  return (
    <>
      <button
        type="button"
        style={S.trigger}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={t("Công cụ toán học", "Math tools")}
        aria-label={t("Mở công cụ toán học", "Open math tools")}
      >
        📐
      </button>

      {open && (
        <>
          <div style={S.overlay} onClick={() => setOpen(false)} />
          <aside style={S.panel} aria-label={t("Công cụ minh họa toán học", "Math visualization tools")}>
            <div style={S.header}>
              <div>
                <div style={S.title}>{t("Công cụ minh họa", "Visualization tools")}</div>
                <div style={{ fontSize: 12, opacity: 0.78 }}>{selectedTool.title}</div>
              </div>
              <button type="button" style={S.close} onClick={() => setOpen(false)} aria-label={t("Đóng", "Close")}>
                x
              </button>
            </div>
            <div style={S.tabs} role="tablist">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTool === tool.id}
                  style={S.tab(activeTool === tool.id)}
                  onClick={() => setActiveTool(tool.id)}
                >
                  {tool.label}
                </button>
              ))}
            </div>
            <div style={S.frameWrap}>
              <iframe
                key={selectedTool.id}
                style={S.frame}
                src={selectedTool.src}
                title={selectedTool.title}
                allow="fullscreen"
              />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
