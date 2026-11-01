"use client";

export default function CodebaseDocsPage() {
  return (
    <main style={{ width: "100%", height: "100vh", background: "#040816" }}>
      <iframe
        src="/docs/index.html"
        title="BingMath / DuoSTEAM — Simplified Backend & Mobile Documentation"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </main>
  );
}
