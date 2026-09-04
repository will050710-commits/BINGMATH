"use client";
import React from "react";
import Link from "next/link";
import ClanCreateForm from "@/components/clans/ClanCreateForm";

export default function CreateClanPage() {
  return (
    <div style={{
      minHeight: "100vh",
      paddingBottom: 120,
      paddingTop: 32,
      paddingLeft: "clamp(16px, 4vw, 48px)",
      paddingRight: "clamp(16px, 4vw, 48px)",
      maxWidth: 860,
      margin: "0 auto",
    }}>
      {/* Breadcrumb navigation */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 28,
        fontFamily: "monospace",
        fontSize: 12,
        color: "rgba(255,255,255,0.4)",
        userSelect: "none",
      }}>
        <Link
          href="/mrm"
          style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#22d3ee")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          MathMap Hub
        </Link>
        <span>/</span>
        <Link
          href="/clans"
          style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#22d3ee")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          Math Clans
        </Link>
        <span>/</span>
        <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>Tạo Clan Mới</span>
      </nav>

      {/* Creation Form */}
      <ClanCreateForm />
    </div>
  );
}
