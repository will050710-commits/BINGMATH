"use client";
import React, { use } from "react";
import Link from "next/link";
import { useMathMapStore } from "@/context/MathMapStore";
import { useAuth } from "@/context/authContext";
import MathMapHero from "@/components/mathmap/MathMapHero";
import LearningObjectives from "@/components/mathmap/LearningObjectives";
import TopicList from "@/components/mathmap/TopicList";
import CommentSection from "@/components/mathmap/CommentSection";

const FALLBACK_MAPS = {
  mm001: {
    id: "mm001",
    title: "Phương Trình & Bất Phương Trình Nâng Cao",
    grade: "Lớp 11",
    subject: "Đại số",
    description:
      "MathMap tổng hợp 18 bài học từ cơ bản đến chuyên sâu về phương trình bậc hai, hệ phương trình và ứng dụng thực tế. Phù hợp cho học sinh ôn luyện thi THPT QG và nâng cao tư duy giải toán.",
    difficulty_fmp: 4.3,
    topicCount: 5,
    learnersCount: 4920,
    maxXP: 1250,
    completionRate: 78,
    objectives: [
      "Giải thành thạo phương trình bậc hai bằng 3 phương pháp khác nhau (Delta, đổi biến, hệ số Vieta)",
      "Áp dụng định lý Vi-ét vào bài toán thực tế và tìm tham số m",
      "Giải hệ bất phương trình và biện luận tập nghiệm chuẩn cấu trúc đề thi",
    ],
    topics: [
      {
        id: "t1",
        sequenceIndex: 1,
        name: "Ôn tập phương trình bậc nhất & Đưa về bậc nhất",
        exerciseCount: 6,
        difficulty: 1.8,
        progress: 100,
        earnedRank: "SS",
        xp: 120,
        status: "completed",
      },
      {
        id: "t2",
        sequenceIndex: 2,
        name: "Phương trình bậc hai một ẩn & Biệt thức Delta",
        exerciseCount: 9,
        difficulty: 3.2,
        progress: 65,
        xp: 180,
        status: "in_progress",
      },
      {
        id: "t3",
        sequenceIndex: 3,
        name: "Định lý Vi-ét & Ứng dụng tìm tham số m",
        exerciseCount: 7,
        difficulty: 4.1,
        progress: 15,
        xp: 210,
        status: "in_progress",
      },
      {
        id: "t4",
        sequenceIndex: 4,
        name: "Hệ bất phương trình bậc hai hai ẩn",
        exerciseCount: 10,
        difficulty: 5.6,
        progress: 0,
        xp: 260,
        status: "not_started",
      },
      {
        id: "t5",
        sequenceIndex: 5,
        name: "Phương trình chứa căn & Đổi biến nâng cao",
        exerciseCount: 12,
        difficulty: 7.8,
        progress: 0,
        xp: 350,
        status: "locked",
        unlockRequirement: "Hoàn thành Chủ đề 4 với rank A trở lên",
      },
    ],
  },
  mm002: {
    id: "mm002",
    title: "Hình học phẳng & Hệ thức lượng trong tam giác",
    grade: "Lớp 10",
    subject: "Hình học",
    description:
      "Nắm vững các định lý Sin, Cosin, công thức diện tích tam giác và giải quyết các bài toán hình học phẳng từ căn bản đến nâng cao.",
    difficulty_fmp: 3.6,
    topicCount: 4,
    learnersCount: 3820,
    maxXP: 980,
    completionRate: 84,
    objectives: [
      "Áp dụng định lý Sin, Cosin để tính cạnh và góc tam giác",
      "Tính diện tích tam giác theo 5 công thức khác nhau",
      "Giải các bài toán thực tế đo đạc góc và khoảng cách",
    ],
    topics: [
      {
        id: "t1",
        sequenceIndex: 1,
        name: "Định lý Cosin và Định lý Sin",
        exerciseCount: 8,
        difficulty: 2.8,
        progress: 100,
        earnedRank: "S",
        xp: 150,
        status: "completed",
      },
      {
        id: "t2",
        sequenceIndex: 2,
        name: "Các công thức tính diện tích tam giác",
        exerciseCount: 6,
        difficulty: 3.4,
        progress: 40,
        xp: 180,
        status: "in_progress",
      },
      {
        id: "t3",
        sequenceIndex: 3,
        name: "Giải tam giác và ứng dụng thực tế",
        exerciseCount: 10,
        difficulty: 4.5,
        progress: 0,
        xp: 220,
        status: "not_started",
      },
    ],
  },
};

export default function MathMapDetailPage({ params }) {
  const unwrappedParams = use(params);
  const mapId = unwrappedParams?.id || "mm001";

  const { mathmaps } = useMathMapStore();
  const { user } = useAuth();

  // Find in store or fallback
  const storeMap = mathmaps?.find?.((m) => m.id === mapId);
  const fallback = FALLBACK_MAPS[mapId] || FALLBACK_MAPS.mm001;

  const mapData = {
    id: mapId,
    title: storeMap?.title || fallback.title,
    grade: storeMap?.grade || fallback.grade,
    subject: storeMap?.tags?.[0]?.replace("#", "") || fallback.subject,
    description: storeMap?.description || fallback.description,
    difficulty_fmp: storeMap?.difficulty_fmp || fallback.difficulty_fmp,
    topicCount: fallback.topics?.length || storeMap?.question_count || 5,
    learnersCount: storeMap?.plays || fallback.learnersCount,
    maxXP: fallback.maxXP,
    completionRate: fallback.completionRate,
    objectives: fallback.objectives,
    topics: fallback.topics,
  };

  const currentUser = {
    username: user?.username || user?.email?.split("@")[0] || "Học Viên",
    rank: user?.rank || "A",
  };

  return (
    <div style={{
      minHeight: "100vh",
      paddingBottom: 120, paddingTop: 32,
      paddingLeft: "clamp(16px, 4vw, 48px)",
      paddingRight: "clamp(16px, 4vw, 48px)",
      maxWidth: 1000, margin: "0 auto",
    }}>
      {/* Breadcrumb navigation */}
      <nav style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 28,
        fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.4)",
        userSelect: "none",
      }}>
        <Link href="/mrm" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          onMouseEnter={e => e.currentTarget.style.color = "#22d3ee"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
        >
          MathMap Hub
        </Link>
        <span>/</span>
        <Link href="/mrm/singleplayer" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          onMouseEnter={e => e.currentTarget.style.color = "#22d3ee"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
        >
          Khám phá
        </Link>
        <span>/</span>
        <span style={{
          color: "rgba(255,255,255,0.75)", fontWeight: 700,
          maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {mapData.title}
        </span>
      </nav>

      {/* Hero Overview */}
      <MathMapHero
        id={mapData.id} title={mapData.title} grade={mapData.grade}
        subject={mapData.subject} description={mapData.description}
        difficulty_fmp={mapData.difficulty_fmp} topicCount={mapData.topicCount}
        learnersCount={mapData.learnersCount} maxXP={mapData.maxXP}
        completionRate={mapData.completionRate}
      />

      {/* Learning Objectives */}
      <LearningObjectives objectives={mapData.objectives} />

      {/* Topic Progression List */}
      <TopicList mathmapId={mapData.id} topics={mapData.topics} />

      {/* Threaded Discussion Section */}
      <CommentSection mathmapId={mapData.id} currentUser={currentUser} />
    </div>
  );
}

