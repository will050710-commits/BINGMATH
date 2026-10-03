// Question-to-skill mapping and skill metadata for the BINGSTEAM reading test.
// This file is intentionally simple so you can tweak skills/questions easily.

// Map each question to the skills it exercises.
// Keys must match the keys used in ANSWER_KEY for each section.
export const QUESTION_SKILLS = {
  section1: {
    // TRUE/FALSE/NOT GIVEN – basic factual comprehension
    1: ["reading_detail_true_false"],
    2: ["reading_inference", "reading_true_false_ng"],
    3: ["reading_inference", "reading_true_false_ng"],
    4: ["reading_detail_true_false"],
    5: ["reading_cause_effect"],
  },
  section2: {
    // Another T/F/NG set – slightly higher-level reasoning
    1: ["reading_detail_true_false"],
    2: ["reading_inference"],
    3: ["reading_inference", "reading_true_false_ng"],
    4: ["reading_cause_effect"],
    5: ["reading_overall_reasoning"],
  },
  section3: {
    // Short-answer / numeric questions – here we use more general labels
    "1-0": ["reading_detail_scanning"],
    "1-1": ["reading_detail_scanning"],
    "2-0": ["reading_detail_scanning"],
    "2-1": ["reading_inference"],
    "3-0": ["reading_detail_scanning"],
    "3-1": ["reading_inference"],
    "4-0": ["reading_cause_effect"],
    "4-1": ["reading_cause_effect"],
    "5-0": ["reading_overall_reasoning"],
  },
};

// Canonical definitions for each skill.
export const SKILL_DEFS = {
  reading_detail_true_false: {
    id: "reading_detail_true_false",
    name: "Đọc chi tiết – TRUE/FALSE",
    topic: "Reading comprehension",
    description:
      "Xác định xem một thông tin chi tiết trong đoạn văn là đúng, sai hay không được đề cập.",
  },
  reading_true_false_ng: {
    id: "reading_true_false_ng",
    name: "TRUE/FALSE/NOT GIVEN",
    topic: "Reading comprehension",
    description:
      "Phân biệt giữa thông tin trái ngược, phù hợp với bài đọc hoặc không được nhắc tới.",
  },
  reading_inference: {
    id: "reading_inference",
    name: "Suy luận từ ngữ cảnh",
    topic: "Reading comprehension",
    description:
      "Suy ra ý ẩn sau thông tin được nêu, không chỉ dựa trên các câu chữ bề mặt.",
  },
  reading_cause_effect: {
    id: "reading_cause_effect",
    name: "Nguyên nhân – Kết quả",
    topic: "Reading comprehension",
    description:
      "Nhận diện quan hệ nguyên nhân – kết quả giữa các sự kiện trong đoạn văn.",
  },
  reading_overall_reasoning: {
    id: "reading_overall_reasoning",
    name: "Lập luận tổng thể",
    topic: "Reading comprehension",
    description:
      "Hiểu được mạch lập luận chung, mục tiêu và thông điệp chính của văn bản.",
  },
  reading_detail_scanning: {
    id: "reading_detail_scanning",
    name: "Quét thông tin (Scanning)",
    topic: "Reading comprehension",
    description:
      "Tìm nhanh số liệu, tên riêng hoặc chi tiết cụ thể trong một đoạn văn dài.",
  },
};

