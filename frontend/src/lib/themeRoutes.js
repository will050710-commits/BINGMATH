// frontend/src/lib/themeRoutes.js
//
// Redesign Claude-style — Đợt 1 + Mobile Web Theme Unification.
//
// Một NGUỒN SỰ THẬT duy nhất cho câu hỏi "route này dùng theme nào":
//   • ink   — MẶC ĐỊNH cho toàn app (nền than ấm #141413). Mọi khu học/thi/game
//             giữ nguyên bố cục tối hiện có nên không có rủi ro vỡ tương phản.
//   • paper — marketing + trang công khai (nền giấy #f5f4ed), xem PAPER_ROUTES.
//
// Đồng thời ánh xạ nhất quán với 4 chế độ theme của Mobile App Shell:
//   • "light"       → data-theme="paper", data-mobile-theme="light"
//   • "dark"        → data-theme="ink",   data-mobile-theme="dark"
//   • "liquidGlass" → data-theme="ink",   data-mobile-theme="liquidGlass"
//   • "system"      → theo prefers-color-scheme ("paper"/"light" hoặc "ink"/"dark")

export const THEME_STORAGE_KEY = "duomath_theme";
export const MOBILE_THEME_STORAGE_KEY = "duomath_mobile_theme";
export const LIQUID_GLASS_OPACITY_KEY = "bingmath_liquid_glass_opacity";

export const THEME_PAPER = "paper";
export const THEME_INK = "ink";

export const DEFAULT_THEME = THEME_INK;
export const DEFAULT_MOBILE_THEME = "liquidGlass";
export const DEFAULT_LIQUID_GLASS_OPACITY = 0.85;

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

/** Chuẩn hoá giá trị đọc từ localStorage["duomath_theme"]; trả null nếu không hợp lệ. */
export function parseStoredTheme(value) {
  return value === THEME_PAPER || value === THEME_INK ? value : null;
}

/**
 * Chuẩn hoá giá trị đọc từ localStorage["duomath_mobile_theme"].
 * @param {string | null | undefined} value
 * @returns {"light" | "dark" | "liquidGlass" | "system" | null}
 */
export function parseStoredMobileTheme(value) {
  if (
    value === "light" ||
    value === "dark" ||
    value === "liquidGlass" ||
    value === "system"
  ) {
    return value;
  }
  return null;
}

/**
 * Chuẩn hoá độ đục Liquid Glass trong khoảng [0.15, 1].
 * @param {string | number | null | undefined} value
 * @returns {number}
 */
export function clampLiquidGlassOpacity(value) {
  const parsed = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  if (Number.isNaN(parsed)) return DEFAULT_LIQUID_GLASS_OPACITY;
  return Math.max(0.15, Math.min(1, Number(parsed.toFixed(2))));
}

/**
 * Chuyển đổi từ chế độ mobile ("light" | "dark" | "liquidGlass" | "system")
 * sang chế độ mobile thực tế ("light" | "dark" | "liquidGlass") và theme tài liệu ("paper" | "ink").
 * @param {"light" | "dark" | "liquidGlass" | "system"} mode
 * @param {boolean} [systemPrefersLight]
 * @returns {{ resolvedMobileMode: "light" | "dark" | "liquidGlass", documentTheme: "paper" | "ink" }}
 */
export function resolveMobileThemeMode(mode, systemPrefersLight = false) {
  if (mode === "light") {
    return { resolvedMobileMode: "light", documentTheme: THEME_PAPER };
  }
  if (mode === "dark") {
    return { resolvedMobileMode: "dark", documentTheme: THEME_INK };
  }
  if (mode === "system") {
    return systemPrefersLight
      ? { resolvedMobileMode: "light", documentTheme: THEME_PAPER }
      : { resolvedMobileMode: "dark", documentTheme: THEME_INK };
  }
  return { resolvedMobileMode: "liquidGlass", documentTheme: THEME_INK };
}

/**
 * Script cực nhỏ chạy trước paint, chèn ở đầu <body> trong src/app/layout.js.
 * Thứ tự ưu tiên giống hệt ThemeContext:
 *   duomath_mobile_theme → duomath_theme → route → ink.
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
    "var savedMobile=null,savedWeb=null,savedOpacity=null;" +
    "try{" +
    "savedMobile=localStorage.getItem('" + MOBILE_THEME_STORAGE_KEY + "');" +
    "savedWeb=localStorage.getItem('" + THEME_STORAGE_KEY + "');" +
    "savedOpacity=localStorage.getItem('" + LIQUID_GLASS_OPACITY_KEY + "');" +
    "}catch(e){}" +
    "var isPaper=false;var mobileMode='" + DEFAULT_MOBILE_THEME + "';" +
    "if(savedMobile==='light'){isPaper=true;mobileMode='light'}" +
    "else if(savedMobile==='dark'){isPaper=false;mobileMode='dark'}" +
    "else if(savedMobile==='liquidGlass'){isPaper=false;mobileMode='liquidGlass'}" +
    "else if(savedMobile==='system'){" +
    "var sysLight=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-color-scheme: light)').matches;" +
    "isPaper=sysLight;mobileMode=sysLight?'light':'dark';" +
    "}else if(savedWeb==='" + THEME_PAPER + "'||savedWeb==='" + THEME_INK + "'){" +
    "isPaper=savedWeb==='" + THEME_PAPER + "';" +
    "mobileMode=isPaper?'light':'dark';" +
    "}else{" +
    "isPaper=paperRoutes.indexOf(p)>-1;" +
    "if(!isPaper&&lessonReader){var low=p.toLowerCase();" +
    "isPaper=lessonPaths.indexOf(low)>-1;" +
    "if(!isPaper){for(var i=0;i<lessonPrefixes.length;i++){" +
    "if(low.indexOf(lessonPrefixes[i])===0){isPaper=true;break}}}}}" +
    "document.documentElement.setAttribute('data-theme',isPaper?'" +
    THEME_PAPER +
    "':'" +
    THEME_INK +
    "');" +
    "document.documentElement.setAttribute('data-mobile-theme',mobileMode);" +
    "var op=parseFloat(savedOpacity||'0.85');" +
    "if(!isNaN(op)){op=Math.max(0.15,Math.min(1,op));document.documentElement.style.setProperty('--bm-glass-opacity',String(op));}" +
    "}catch(e){document.documentElement.setAttribute('data-theme','" +
    THEME_INK +
    "');}})();"
  );
}
