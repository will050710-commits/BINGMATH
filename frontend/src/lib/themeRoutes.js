// frontend/src/lib/themeRoutes.js
//
// Redesign Claude-style — Đợt 1.
//
// Một NGUỒN SỰ THẬT duy nhất cho câu hỏi "route này dùng theme nào":
//   • ink   — MẶC ĐỊNH cho toàn app (nền than ấm #141413). Mọi khu học/thi/game
//             giữ nguyên bố cục tối hiện có nên không có rủi ro vỡ tương phản.
//   • paper — marketing + trang công khai (nền giấy #f5f4ed), xem PAPER_ROUTES.
//
// Module này KHÔNG import React và KHÔNG đọc localStorage ở cấp module, vì nó
// được dùng ở cả hai phía:
//   • server: src/app/layout.js nhúng buildThemeBootstrapScript() để đặt
//     data-theme TRƯỚC khi paint (chống nháy sáng↔tối khi vào trang paper);
//   • client: src/context/ThemeContext.js giữ theme theo route + override.
//
// Đợt 4 (codemod màu 108 file bài giảng) chỉ cần đổi LESSON_READER_ENABLED
// thành true là các route đọc bài tự chuyển sang paper — không phải sửa
// resolveTheme() ở nơi nào khác.

export const THEME_STORAGE_KEY = "duomath_theme";

export const THEME_PAPER = "paper";
export const THEME_INK = "ink";

export const DEFAULT_THEME = THEME_INK;

/** Trang chủ + các trang công khai/marketing đã migrate token ở Đợt 3. */
export const PAPER_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/privacy",
  "/khampha",
  "/tailieu",
  "/Cacbaitoan",
  "/DuoTranslate",
];

/**
 * Các route "đọc bài học". Danh sách tĩnh này phải khớp với isLessonPath()
 * trong src/components/LayoutClient.js (nơi quyết định có mount DuoTranslate).
 */
export const STATIC_LESSON_PATHS = [
  "/menh-de",
  "/tap-hop",
  "/phep-toan-tap-hop",
  "/bpt-bac-nhat-2-an",
  "/chuong2-10",
  "/ham-so-va-do-thi",
  "/ham-so-bac-hai",
  "/gia-tri-luong-giac",
  "/ontapchuong1",
  "/ontapchuong4",
];

/** Tiền tố route bài học động (/lesson*, /l11-*, /l12-*). */
export const LESSON_PREFIXES = ["/lesson", "/l11-", "/l12-"];

/**
 * Đợt 4 mới bật: nội dung bài giảng (components/thpt/Cacbaitoan10|11|12) còn
 * hardcode màu tối trong inline style, chưa thể hiển thị trên nền giấy.
 * Bật cờ này chỉ sau khi codemod màu + soi ảnh 6 bài đại diện xong.
 */
export const LESSON_READER_ENABLED = false;

/** "/login/" → "/login"; "/" giữ nguyên. */
export function normalizePath(pathname) {
  if (!pathname) return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function isLessonReaderPath(pathname) {
  const path = normalizePath(pathname).toLowerCase();
  if (STATIC_LESSON_PATHS.includes(path)) return true;
  return LESSON_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/** Route → theme (chưa tính lựa chọn thủ công của người dùng). */
export function resolveTheme(pathname) {
  const path = normalizePath(pathname);
  if (PAPER_ROUTES.includes(path)) return THEME_PAPER;
  if (LESSON_READER_ENABLED && isLessonReaderPath(path)) return THEME_PAPER;
  return THEME_INK;
}

/** Chuẩn hoá giá trị đọc từ localStorage; trả null nếu không hợp lệ. */
export function parseStoredTheme(value) {
  return value === THEME_PAPER || value === THEME_INK ? value : null;
}

/**
 * Script cực nhỏ chạy trước paint, chèn ở đầu <body> trong src/app/layout.js.
 * Thứ tự ưu tiên giống hệt ThemeContext: localStorage override → route → ink.
 *
 * Lưu ý CSP: next.config.mjs cho phép script-src 'unsafe-inline' nên script này
 * chạy được; nó chỉ đọc location.pathname + localStorage, không nhận dữ liệu
 * người dùng, không eval, không gọi mạng.
 */
export function buildThemeBootstrapScript() {
  const paperRoutes = JSON.stringify(PAPER_ROUTES);
  const lessonPaths = JSON.stringify(STATIC_LESSON_PATHS);
  const lessonPrefixes = JSON.stringify(LESSON_PREFIXES);
  return (
    "(function(){try{" +
    "var p=location.pathname.replace(/\\/+$/,'')||'/';" +
    `var paperRoutes=${paperRoutes};` +
    `var lessonPaths=${lessonPaths};` +
    `var lessonPrefixes=${lessonPrefixes};` +
    `var lessonReader=${LESSON_READER_ENABLED};` +
    "var saved=null;try{saved=localStorage.getItem('" + THEME_STORAGE_KEY + "')}catch(e){}" +
    "var isPaper=false;" +
    "if(saved==='" + THEME_PAPER + "'||saved==='" + THEME_INK + "'){isPaper=saved==='paper'}" +
    "else{isPaper=paperRoutes.indexOf(p)>-1;" +
    "if(!isPaper&&lessonReader){var low=p.toLowerCase();" +
    "isPaper=lessonPaths.indexOf(low)>-1;" +
    "if(!isPaper){for(var i=0;i<lessonPrefixes.length;i++){" +
    "if(low.indexOf(lessonPrefixes[i])===0){isPaper=true;break}}}}}" +
    "document.documentElement.setAttribute('data-theme',isPaper?'" +
    THEME_PAPER +
    "':'" +
    THEME_INK +
    "');" +
    "}catch(e){document.documentElement.setAttribute('data-theme','" +
    THEME_INK +
    "');" +
    "}})();"
  );
}
