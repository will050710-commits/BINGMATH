"use client";
/**
 * /stats/page.js — DuoMath User Statistics Dashboard
 * Thiết kế tham khảo osu! profile + Duolingo stats
 *
 * Sections:
 *  1. Profile header (avatar, level, league, streak, XP bar)
 *  2. Hexagon radar chart (6 chiều)
 *  3. Test accuracy history (30 ngày — bar chart)
 *  4. Topic mastery breakdown
 *  5. Daily quests hôm nay
 *  6. Badge showcase
 *  7. Weak topics alert
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { getUserStats } from "@/lib/api";
import Link from "next/link";
import { renderDuoIcon } from "@/components/DuoIcons";

// ── Tiny inline chart helpers ─────────────────────────────────────────────────
function HexagonChart({ data }) {
  if (!data || data.length === 0) return null;
  const cx = 150, cy = 150, maxR = 120;
  const n = data.length;
  const angles = data.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);

  function polar(val, i) {
    const r = (val / 100) * maxR;
    return { x: cx + r * Math.cos(angles[i]), y: cy + r * Math.sin(angles[i]) };
  }

  const outerPoints = angles.map((a) => ({
    x: cx + maxR * Math.cos(a),
    y: cy + maxR * Math.sin(a),
  }));
  const dataPoints = data.map((d, i) => polar(d.value, i));
  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={300} height={300} viewBox="0 0 300 300" style={{ overflow: "visible" }}>
      {/* Grid rings */}
      {[25, 50, 75, 100].map((r) => (
        <polygon
          key={r}
          points={angles.map((a) => `${cx + (r / 100) * maxR * Math.cos(a)},${cy + (r / 100) * maxR * Math.sin(a)}`).join(" ")}
          fill="none" stroke="var(--border)" strokeWidth={1}
        />
      ))}
      {/* Axis lines */}
      {outerPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth={1} />
      ))}
      {/* Data polygon */}
      <path
        d={toPath(dataPoints)}
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth={2}
      />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
      ))}
      {/* Labels */}
      {data.map((d, i) => {
        const lx = cx + (maxR + 28) * Math.cos(angles[i]);
        const ly = cy + (maxR + 28) * Math.sin(angles[i]);
        return (
          <text
            key={i} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fill="var(--text-muted)" fontSize={12} fontWeight={600}
          >
            {d.subject} ({d.value})
          </text>
        );
      })}
    </svg>
  );
}

function BarChart({ data }) {
  if (!data || data.length === 0) return (
    <div style={{ color: "var(--text-subtle)", textAlign: "center", padding: "32px 0", fontSize: 13 }}>
      Chưa có dữ liệu trong 30 ngày qua
    </div>
  );
  const maxAcc = 100;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, overflowX: "auto", paddingBottom: 4 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 28 }}>
          <div style={{
            width: 20, height: `${(d.accuracy / maxAcc) * 90}px`,
            background: d.accuracy >= 80
              ? "linear-gradient(180deg, var(--stats-ok), var(--stats-ok-2))"
              : d.accuracy >= 60
              ? "linear-gradient(180deg, var(--stats-warn), var(--stats-warn-2))"
              : "linear-gradient(180deg, var(--stats-bad), var(--stats-bad-2))",
            borderRadius: "4px 4px 0 0",
            position: "relative",
            minHeight: 4,
            transition: "height 0.5s ease",
          }} title={`${d.date}: ${d.accuracy}%`} />
          <div style={{ fontSize: 9, color: "var(--text-subtle)", marginTop: 3, transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
            {d.date?.slice(5)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Color maps ────────────────────────────────────────────────────────────────
const LEAGUE_STYLE = {
  Bronze:   { bg: "linear-gradient(135deg,#cd7f32,#a0522d)", glow: "#cd7f32" },
  Silver:   { bg: "linear-gradient(135deg,#b0b0b0,#707070)", glow: "#c0c0c0" },
  Gold:     { bg: "linear-gradient(135deg,#ffd700,#ff8c00)", glow: "#ffd700" },
  Platinum: { bg: "linear-gradient(135deg,#a8d8ea,#aa96da)", glow: "#a8d8ea" },
  Diamond:  { bg: "linear-gradient(135deg,#00d2ff,#7928ca)", glow: "#00d2ff" },
};
const TIER_COLOR = { bronze: "#cd7f32", silver: "#c0c0c0", gold: "#ffd700", platinum: "#e5e4e2" };
const LEVEL_COLORS = ["NB", "TH", "VD", "VDC"];
const LEVEL_BADGE = { NB: { bg: "#1e40af", text: "#93c5fd" }, TH: { bg: "#065f46", text: "#6ee7b7" }, VD: { bg: "#92400e", text: "#fcd34d" }, VDC: { bg: "#7c2d12", text: "#fca5a5" } };

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StatsPage() {
  const { user, ready } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | topics | badges

  useEffect(() => {
    if (!ready) return;
    if (!user) { setLoading(false); return; }
    getUserStats().then(({ ok, data }) => {
      if (ok) setStats(data);
      else setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setLoading(false);
    });
  }, [user, ready]);

  if (!ready || loading) return <LoadingScreen />;
  if (!user) return <NotLoggedIn />;
  if (error) return <ErrorScreen msg={error} />;
  if (!stats) return null;

  const { gamification: gami, test_summary, game_summary, test_history_30d,
          topic_mastery, weak_topics, badges, daily_quests, hexagon_stats } = stats;

  const XP_TO_NEXT = [0,100,250,450,700,1000,1400,1900,2500,3200,4000,5000,6200,7600,9200,11000];
  const curThreshold = XP_TO_NEXT[Math.max(0, gami.level - 1)] || 0;
  const nextThreshold = XP_TO_NEXT[gami.level] || XP_TO_NEXT[XP_TO_NEXT.length - 1];
  const xpPct = nextThreshold > curThreshold
    ? Math.min(100, ((gami.total_xp - curThreshold) / (nextThreshold - curThreshold)) * 100)
    : 100;
  const leagueStyle = LEAGUE_STYLE[gami.league] || LEAGUE_STYLE.Bronze;

  return (
    <div style={{ minHeight: "100vh", padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
      <style>{`
        :root { --stats-ok: #4ade80; --stats-ok-2: #16a34a; --stats-warn: #fbbf24; --stats-warn-2: #f59e0b; --stats-bad: #f87171; --stats-bad-2: #ef4444; }
        [data-theme="paper"] { --stats-ok: #16a34a; --stats-ok-2: #15803d; --stats-warn: #d97706; --stats-warn-2: #b45309; --stats-bad: #dc2626; --stats-bad-2: #b91c1c; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; box-shadow: var(--shadow-whisper); }
        .stat-card:hover { border-color: var(--border-strong); transition: border-color 0.2s; }
        .tab-btn { padding: 8px 20px; border-radius: 20px; border: 1.5px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .tab-btn.active { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
        .tab-btn:hover:not(.active) { border-color: var(--border-strong); color: var(--text); }
        .badge-card { padding: 12px; border-radius: 12px; border: 1.5px solid; display: flex; align-items: center; gap: 10px; }
        .badge-card.earned { background: var(--accent-soft); }
        .badge-card.locked { background: var(--surface-2); opacity: 0.5; filter: grayscale(0.6); }
        @media (max-width: 640px) {
          .hex-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Profile Header ── */}
      <div className="stat-card" style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.username}`}
            alt={user.username}
            style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: `3px solid ${leagueStyle.glow}`, boxShadow: `0 0 20px ${leagueStyle.glow}55` }}
          />
          <div style={{
            position: "absolute", bottom: -4, right: -4,
            background: leagueStyle.bg, borderRadius: 10, padding: "2px 8px",
            fontSize: 11, fontWeight: 800, color: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}>Lv.{gami.level}</div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: 0 }}>{user.username}</h1>
            <span style={{
              background: leagueStyle.bg, borderRadius: 12, padding: "3px 12px",
              fontSize: 12, fontWeight: 700, color: "#fff",
            }}>🏆 {gami.league}</span>
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Streak 🔥 {gami.current_streak} ngày · Dài nhất: {gami.longest_streak} ngày · ELO: {gami.elo_rating}
          </div>
          {/* XP bar */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
              <span>{gami.total_xp?.toLocaleString()} XP</span>
              <span>Level {gami.level + 1}: {nextThreshold?.toLocaleString()} XP</span>
            </div>
            <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${xpPct}%`, height: "100%",
                background: "linear-gradient(90deg, var(--accent), var(--accent-strong))",
                borderRadius: 4, transition: "width 1s ease",
              }} />
            </div>
          </div>
        </div>

        {/* Freeze tokens */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28 }}>🧊</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{gami.freeze_count}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Freeze</div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Bài test",      value: test_summary?.total_tests, icon: "📝" },
          { label: "Accuracy TB",   value: `${test_summary?.overall_acc || 0}%`, icon: "🎯" },
          { label: "Best score",    value: `${test_summary?.best_acc || 0}%`, icon: "🏅" },
          { label: "Minigames",     value: game_summary?.total_games, icon: "🎮" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="stat-card" style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 26, display: "inline-flex", alignItems: "center", justifyContent: "center", height: 32 }}>{renderDuoIcon(icon, { size: 30 })}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginTop: 4 }}>{value ?? "—"}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["overview", "topics", "badges"].map((t) => (
          <button key={t} className={`tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {t === "overview" && "📊"}
            {t === "topics" && renderDuoIcon("📚", { size: 14 })}
            {t === "badges" && "🎖️"}
            {{ overview: " Tổng quan", topics: " Chủ đề", badges: " Badges" }[t]}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="hex-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Hexagon */}
          <div className="stat-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>
              🔷 Hexagon Stats
            </h3>
            <HexagonChart data={hexagon_stats} />
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Test history */}
            <div className="stat-card">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>
                📅 Accuracy 30 ngày qua
              </h3>
              <BarChart data={test_history_30d} />
            </div>

            {/* Daily quests */}
            <div className="stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-muted)", margin: 0 }}>
                  📋 Nhiệm vụ hôm nay
                </h3>
                <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>
                  {daily_quests?.completed}/{daily_quests?.total} hoàn thành
                </span>
              </div>
              {daily_quests?.quests?.map((q) => {
                const pct = Math.min(100, (q.current_value / q.target_value) * 100);
                return (
                  <div key={q.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: q.is_completed ? "var(--stats-ok)" : "var(--text)" }}>
                        {q.is_completed ? "✅ " : "⬜ "}{q.quest_label_vi}
                      </span>
                      <span style={{ color: "var(--stats-warn)", fontWeight: 700 }}>+{q.xp_reward} XP</span>
                    </div>
                    <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: q.is_completed ? "linear-gradient(90deg, var(--stats-ok), var(--stats-ok-2))" : "linear-gradient(90deg, var(--accent), var(--accent-strong))",
                        borderRadius: 3,
                      }} />
                    </div>
                    <div style={{ textAlign: "right", fontSize: 10, color: "var(--text-subtle)", marginTop: 2 }}>
                      {q.current_value}/{q.target_value}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weak topics alert */}
            {weak_topics?.length > 0 && (
              <div className="stat-card" style={{ borderColor: "var(--stats-bad)", background: "var(--surface)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--stats-bad)", marginBottom: 10 }}>
                  ⚠️ Cần ôn tập
                </h3>
                {weak_topics.map((t) => (
                  <div key={t.topic} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 0", borderBottom: "1px solid var(--border)",
                    fontSize: 13,
                  }}>
                    <span style={{ color: "var(--text)" }}>{t.topic}</span>
                    <span style={{ color: "var(--stats-bad)", fontWeight: 700 }}>{t.accuracy}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Topics Tab ── */}
      {activeTab === "topics" && (
        <div className="stat-card">
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-muted)", marginBottom: 16 }}>
            📚 Topic Mastery
          </h3>
          {topic_mastery?.length === 0 && (
            <div style={{ color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>
              Chưa có dữ liệu — hãy làm bài để mở khóa Adaptive Learning!
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topic_mastery?.map((t) => {
              const lvlStyle = LEVEL_BADGE[t.level] || LEVEL_BADGE.NB;
              return (
                <div key={t.topic} style={{
                  display: "grid", gridTemplateColumns: "1fr auto 80px auto",
                  alignItems: "center", gap: 12, padding: "12px 16px",
                  background: "var(--surface-2)", borderRadius: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{t.topic}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.attempts} lần thử</div>
                  </div>
                  <span style={{
                    background: lvlStyle.bg, color: lvlStyle.text,
                    borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700,
                  }}>{t.level}</span>
                  <div>
                    <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        width: `${t.accuracy}%`, height: "100%",
                        background: t.accuracy >= 80 ? "linear-gradient(90deg, var(--stats-ok), var(--stats-ok-2))"
                          : t.accuracy >= 60 ? "linear-gradient(90deg, var(--stats-warn), var(--stats-warn-2))"
                          : "linear-gradient(90deg, var(--stats-bad), var(--stats-bad-2))",
                        borderRadius: 3,
                      }} />
                    </div>
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 800, textAlign: "right",
                    color: t.accuracy >= 80 ? "var(--stats-ok)" : t.accuracy >= 60 ? "var(--stats-warn)" : "var(--stats-bad)",
                  }}>{t.accuracy}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Badges Tab ── */}
      {activeTab === "badges" && (
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-muted)", margin: 0 }}>
              🎖️ Badges ({badges?.length || 0} đã đạt)
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 12 }}>
            {badges?.map((b) => (
              <div key={b.id} className={`badge-card earned`}
                style={{ borderColor: TIER_COLOR[b.tier] || "#ffd700" }}>
                <span style={{ fontSize: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36 }}>{renderDuoIcon(b.icon, { size: 36 })}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TIER_COLOR[b.tier] || "#ffd700" }}>
                    {b.name_vi}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>{b.math_term}</div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 2 }}>{b.desc_vi}</div>
                </div>
              </div>
            ))}
            {(!badges || badges.length === 0) && (
              <div style={{ color: "var(--text-subtle)", textAlign: "center", padding: "32px 0", gridColumn: "1/-1" }}>
                Chưa có badge — hãy hoàn thành bài test để bắt đầu thu thập! 🏅
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Back link ── */}
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/Trangchu" style={{ color: "var(--accent)", fontSize: 14, textDecoration: "none" }}>
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}

// ── Sub-screens ───────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "var(--text-muted)" }}>Đang tải Statistics...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}

function NotLoggedIn() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ color: "var(--text-muted)", fontSize: 16 }}>Vui lòng đăng nhập để xem thống kê</div>
      <Link href="/login" style={{
        background: "linear-gradient(135deg, var(--accent), var(--accent-strong))", color: "#fff",
        padding: "10px 28px", borderRadius: 12, fontWeight: 700, textDecoration: "none",
      }}>Đăng nhập</Link>
    </div>
  );
}

function ErrorScreen({ msg }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <div style={{ color: "var(--danger)" }}>{msg}</div>
    </div>
  );
}
