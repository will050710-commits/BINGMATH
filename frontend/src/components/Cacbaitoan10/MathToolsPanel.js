"use client";

import { useState } from "react";

const TOOLS = [
  {
    id: "desmos",
    label: "Desmos",
    title: "Graphing Calculator",
    src: "https://www.desmos.com/calculator?embed",
  },
  {
    id: "geogebra",
    label: "GeoGebra",
    title: "Geometry and Algebra",
    src: "https://www.geogebra.org/classic?embed",
  },
];

export default function MathToolsPanel({ lang = "vi" }) {
  const [open, setOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(TOOLS[0].id);
  const t = (vi, en) => (lang === "vi" ? vi : en);
  const selectedTool = TOOLS.find((tool) => tool.id === activeTool) || TOOLS[0];

  const S = {
    trigger: {
      position: "absolute",
      top: 12,
      right: 12,
      zIndex: 3,
      border: "1px solid rgba(255,255,255,0.55)",
      background: "rgba(11,79,92,0.88)",
      color: "white",
      borderRadius: 8,
      padding: "9px 12px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
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
      background: "#0B4F5C",
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
      gap: 8,
      padding: "12px 16px",
      borderBottom: "1px solid #e6eef0",
      background: "#f7fbfc",
    },
    tab: (active) => ({
      border: `1px solid ${active ? "#0B4F5C" : "#ccdadd"}`,
      borderRadius: 8,
      background: active ? "#0B4F5C" : "white",
      color: active ? "white" : "#244248",
      padding: "9px 14px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
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
      background: "white",
    },
  };

  return (
    <>
      <button type="button" style={S.trigger} onClick={() => setOpen(true)}>
        {t("Công cụ toán", "Math tools")}
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
