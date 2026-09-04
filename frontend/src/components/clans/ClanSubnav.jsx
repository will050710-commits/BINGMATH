"use client";
import React from "react";

export default function ClanSubnav({
  activeTab = "battles",
  onTabChange = () => {},
}) {
  const TABS = [
    { id: "overview", label: "Tổng quan" },
    { id: "members", label: "Thành viên" },
    { id: "battles", label: "Đấu Nhóm" },
    { id: "leaderboard", label: "Bảng Xếp Hạng" },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      overflowX: "auto", marginBottom: 0,
    }}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              position: "relative", padding: "12px 20px",
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: isActive ? 800 : 600,
              textTransform: "uppercase", letterSpacing: 1,
              color: isActive ? "white" : "rgba(255,255,255,0.4)",
              whiteSpace: "nowrap", flexShrink: 0,
              transition: "color 0.2s",
              borderBottom: isActive
                ? "2px solid transparent"
                : "2px solid transparent",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
          >
            {tab.label}
            {isActive && (
              <span style={{
                position: "absolute", bottom: 0, left: 12, right: 12, height: 2,
                borderRadius: 100,
                background: "linear-gradient(90deg, #f472b6, #22d3ee)",
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
