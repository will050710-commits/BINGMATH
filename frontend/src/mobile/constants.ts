import type {
  AvatarPreset,
  BingMCBSuggestion,
  GradeTrack,
  InterfaceGuideStep,
  LeaderboardFilter,
  LiquidGlassOpacityPreset,
  MobileTabConfig,
  MRMMap,
  QuickActionItem,
  ThemePalette,
} from "./types";

/**
 * Exact AsyncStorage / localStorage keys extracted from D:\BingMATH.apk
 */
export const STORAGE_KEYS = {
  THEME: "duomath_mobile_theme",
  WEB_THEME: "duomath_theme",
  LIQUID_GLASS_OPACITY: "bingmath_liquid_glass_opacity",
  LANG: "duomath_lang",
  GUEST_MODE: "bingmath_guest_mode",
  CACHED_PROFILE: "bingmath_cached_profile",
  ONBOARDING_DONE: "onboarding_done",
  INTRO_SEEN: "bingmath_intro_seen",
  V1_OFFICIAL_INTRO_SEEN: "bingmath_v1_official_intro_seen",
  TRIGGER_V1_GUIDE: "bingmath_trigger_v1_guide",
  V1_GUIDE_SEEN: "bingmath_v1_guide_seen",
  BONUS_XP: "bingmath_bonus_xp",
  SOLVED_TODAY: "bingmath_solved_today",
  SOLVED_DATE: "bingmath_solved_date",
  OFFLINE_PROGRESSED: "bingmath_offline_progressed",
} as const;

/**
 * Exact 3-mode Theme Palettes extracted from D:\BingMATH.apk (bundle lines 260336–260435)
 */
export const DarkTheme: ThemePalette = {
  mode: "dark",
  isDark: true,
  isLiquidGlass: false,
  bg: "#020c1b",
  bgElevated: "#071426",
  bgSurface: "rgba(10,25,47,0.75)",
  bgCard: "rgba(13,31,58,0.85)",
  bgCardHover: "rgba(20,45,82,0.9)",
  bgGlass: "rgba(255,255,255,0.04)",
  bgInput: "rgba(255,255,255,0.06)",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  textInverse: "#020c1b",
  primary: "#22d3ee",
  primaryDark: "#0891b2",
  primaryGlow: "rgba(34,211,238,0.18)",
  accent: "#a855f7",
  accentGlow: "rgba(168,85,247,0.18)",
  gold: "#fbbf24",
  goldGlow: "rgba(251,191,36,0.15)",
  success: "#34d399",
  successBg: "rgba(52,211,153,0.12)",
  danger: "#f87171",
  dangerBg: "rgba(248,113,113,0.12)",
  border: "rgba(255,255,255,0.08)",
  borderSubtle: "rgba(255,255,255,0.05)",
  borderAccent: "rgba(34,211,238,0.35)",
  tabBar: "#041022",
  tabBarBorder: "rgba(34,211,238,0.14)",
  headerBg: "#041022",
  shadowColor: "#000000",
  gradientPrimary: ["#06b6d4", "#3b82f6"],
  gradientAccent: ["#8b5cf6", "#ec4899"],
  gradientCard: ["rgba(34,211,238,0.12)", "rgba(168,85,247,0.08)"],
  gradientHero: ["#0891b2", "#4f46e5", "#7e22ce"],
};

export const LightTheme: ThemePalette = {
  mode: "light",
  isDark: false,
  isLiquidGlass: false,
  bg: "#f1f5f9",
  bgElevated: "#ffffff",
  bgSurface: "#ffffff",
  bgCard: "#ffffff",
  bgCardHover: "#f8fafc",
  bgGlass: "rgba(15,23,42,0.03)",
  bgInput: "#f8fafc",
  text: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#64748b",
  textInverse: "#ffffff",
  primary: "#0284c7",
  primaryDark: "#0369a1",
  primaryGlow: "rgba(2,132,199,0.12)",
  accent: "#7c3aed",
  accentGlow: "rgba(124,58,237,0.12)",
  gold: "#d97706",
  goldGlow: "rgba(217,119,6,0.12)",
  success: "#059669",
  successBg: "rgba(5,150,105,0.1)",
  danger: "#dc2626",
  dangerBg: "rgba(220,38,38,0.1)",
  border: "#e2e8f0",
  borderSubtle: "#f1f5f9",
  borderAccent: "rgba(2,132,199,0.4)",
  tabBar: "#ffffff",
  tabBarBorder: "#e2e8f0",
  headerBg: "#ffffff",
  shadowColor: "#64748b",
  gradientPrimary: ["#0284c7", "#2563eb"],
  gradientAccent: ["#7c3aed", "#db2777"],
  gradientCard: ["rgba(2,132,199,0.08)", "rgba(124,58,237,0.06)"],
  gradientHero: ["#0284c7", "#4338ca", "#6d28d9"],
};

export const LiquidGlassTheme: ThemePalette = {
  mode: "liquidGlass",
  isDark: true,
  isLiquidGlass: true,
  bg: "#040816",
  bgElevated: "rgba(14, 24, 52, 0.55)",
  bgSurface: "rgba(255, 255, 255, 0.09)",
  bgCard: "rgba(255, 255, 255, 0.12)",
  bgCardHover: "rgba(255, 255, 255, 0.18)",
  bgGlass: "rgba(255, 255, 255, 0.18)",
  bgInput: "rgba(255, 255, 255, 0.12)",
  text: "#ffffff",
  textSecondary: "#cbd5e1",
  textMuted: "#94a3b8",
  textInverse: "#030712",
  primary: "#38bdf8",
  primaryDark: "#0284c7",
  primaryGlow: "rgba(56, 189, 248, 0.30)",
  accent: "#c084fc",
  accentGlow: "rgba(192, 132, 252, 0.28)",
  gold: "#fcd34d",
  goldGlow: "rgba(252, 211, 77, 0.24)",
  success: "#4ade80",
  successBg: "rgba(74, 222, 128, 0.18)",
  danger: "#fb7185",
  dangerBg: "rgba(251, 113, 133, 0.18)",
  border: "rgba(255, 255, 255, 0.24)",
  borderSubtle: "rgba(255, 255, 255, 0.14)",
  borderAccent: "rgba(56, 189, 248, 0.65)",
  tabBar: "rgba(15, 23, 42, 0.52)",
  tabBarBorder: "rgba(255, 255, 255, 0.28)",
  headerBg: "rgba(10, 18, 40, 0.58)",
  shadowColor: "#0284c7",
  gradientPrimary: ["#38bdf8", "#818cf8"],
  gradientAccent: ["#c084fc", "#f472b6"],
  gradientCard: ["rgba(255, 255, 255, 0.18)", "rgba(56, 189, 248, 0.10)"],
  gradientHero: ["#38bdf8", "#a855f7", "#ec4899"],
};

export const THEMES: Record<"dark" | "light" | "liquidGlass", ThemePalette> = {
  dark: DarkTheme,
  light: LightTheme,
  liquidGlass: LiquidGlassTheme,
};

/**
 * Dynamic Liquid Glass palette scaling by user opacity (0.15..1.0, default 0.85)
 * Reconstructed from ThemeProvider (bundle lines 260080–260185)
 */
export function buildLiquidGlassPalette(opacity = 0.85): ThemePalette {
  const clamped = Math.max(0.15, Math.min(1, Number(opacity) || 0.85));
  const fmt = (val: number) => Math.min(0.95, Math.max(0.03, val)).toFixed(2);
  return {
    ...LiquidGlassTheme,
    bgElevated: `rgba(14, 24, 52, ${fmt(0.65 * clamped)})`,
    bgSurface: `rgba(255, 255, 255, ${fmt(0.11 * clamped)})`,
    bgCard: `rgba(255, 255, 255, ${fmt(0.14 * clamped)})`,
    bgCardHover: `rgba(255, 255, 255, ${fmt(0.21 * clamped)})`,
    bgGlass: `rgba(255, 255, 255, ${fmt(0.21 * clamped)})`,
    bgInput: `rgba(255, 255, 255, ${fmt(0.14 * clamped)})`,
    border: `rgba(255, 255, 255, ${fmt(0.28 * clamped)})`,
    borderSubtle: `rgba(255, 255, 255, ${fmt(0.16 * clamped)})`,
    tabBar: `rgba(15, 23, 42, ${fmt(0.62 * clamped)})`,
    tabBarBorder: `rgba(255, 255, 255, ${fmt(0.32 * clamped)})`,
    headerBg: `rgba(10, 18, 40, ${fmt(0.68 * clamped)})`,
  };
}

export const LIQUID_GLASS_OPACITY_PRESETS: LiquidGlassOpacityPreset[] = [
  { labelVI: "25% Mờ", labelEN: "25% Subtle", value: 0.25 },
  { labelVI: "50% Vừa", labelEN: "50% Medium", value: 0.5 },
  { labelVI: "75% Chuẩn", labelEN: "75% Default", value: 0.75 },
  { labelVI: "100% Đậm", labelEN: "100% Bold", value: 1.0 },
];

/**
 * 5 bottom navigation tabs in LiquidGlassTabBar (bundle lines 213942–214010)
 * Mapped to the existing Next.js routes in duosteam/frontend
 */
export const MOBILE_TABS: MobileTabConfig[] = [
  {
    name: "Home",
    webHref: "/Trangchu",
    icon: "🏠",
    labelVI: "Trang chủ",
    labelEN: "Home",
  },
  {
    name: "Learn",
    webHref: "/Cacbaitoan",
    icon: "📚",
    labelVI: "Học tập",
    labelEN: "Learn",
  },
  {
    name: "Battle",
    webHref: "/mrm",
    icon: "⚔️",
    labelVI: "Đấu hạng",
    labelEN: "Battle",
  },
  {
    name: "Library",
    webHref: "/tailieu",
    icon: "📖",
    labelVI: "Tài liệu",
    labelEN: "Library",
  },
  {
    name: "Profile",
    webHref: "/dashboard",
    icon: "👤",
    labelVI: "Hồ sơ",
    labelEN: "Profile",
  },
];

/**
 * Quick Action Grid items on HomeScreen (bundle lines 215201–215209)
 */
export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    key: "learn",
    icon: "📐",
    titleVI: "Học Chuyên Đề",
    titleEN: "Math Lessons",
    subVI: "THCS & THPT · Song ngữ",
    subEN: "Grade 6–12 · Bilingual",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.12)",
    border: "rgba(34,211,238,0.28)",
    apkScreen: "Learn",
    webHref: "/Cacbaitoan",
  },
  {
    key: "battle",
    icon: "⚔️",
    titleVI: "Đấu Trường MRM",
    titleEN: "MRM Arena",
    subVI: "Leo rank · ELO · Giải nhanh",
    subEN: "Ranked · ELO · Speed Math",
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.12)",
    border: "rgba(244,63,94,0.28)",
    apkScreen: "Battle",
    webHref: "/mrm",
  },
  {
    key: "tests",
    icon: "📝",
    titleVI: "Đề Thi & Kiểm Tra",
    titleEN: "Practice Tests",
    subVI: "Đề chuẩn THPT Quốc Gia",
    subEN: "Standardized Exams",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.28)",
    apkScreen: "Learn",
    webHref: "/Cacbaitoan",
  },
  {
    key: "library",
    icon: "📖",
    titleVI: "Sổ Tay Công Thức",
    titleEN: "Formula Library",
    subVI: "Tra cứu nhanh Đại số & Hình",
    subEN: "Quick Algebra & Geometry",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.28)",
    apkScreen: "Library",
    webHref: "/tailieu",
  },
];

/**
 * Grade Tracks on HomeScreen (bundle lines 215211–215219)
 */
export const GRADE_TRACKS: GradeTrack[] = [
  {
    grade: "10",
    titleVI: "Toán Lớp 10",
    titleEN: "Grade 10 Math",
    descVI: "Mệnh đề · Tập hợp · Hàm số bậc hai · Vectơ · Thống kê",
    descEN: "Logic · Sets · Quadratic Functions · Vectors · Statistics",
    topicsVI: "12 bài học · 3 đề kiểm tra",
    topicsEN: "12 lessons · 3 practice tests",
    icon: "📐",
    color: "#22d3ee",
    badge: "THPT · Khối 10",
    webHref: "/Cacbaitoan?grade=10",
  },
  {
    grade: "11",
    titleVI: "Toán Lớp 11",
    titleEN: "Grade 11 Math",
    descVI: "Lượng giác · Dãy số · Giới hạn · Đạo hàm · Xác suất",
    descEN: "Trigonometry · Sequences · Limits · Derivatives · Probability",
    topicsVI: "12 bài học · 2 đề kiểm tra",
    topicsEN: "12 lessons · 2 practice tests",
    icon: "📈",
    color: "#a855f7",
    badge: "THPT · Khối 11",
    webHref: "/Cacbaitoan?grade=11",
  },
  {
    grade: "12",
    titleVI: "Toán Lớp 12",
    titleEN: "Grade 12 Math",
    descVI: "Khảo sát hàm số · Nguyên hàm · Tích phân · Oxyz · Xác suất",
    descEN: "Curve Sketching · Integrals · 3D Oxyz · Conditional Probability",
    topicsVI: "17 bài học · Luyện thi THPT QG",
    topicsEN: "17 lessons · National Exam Prep",
    icon: "🎓",
    color: "#fbbf24",
    badge: "THPT · Khối 12",
    webHref: "/Cacbaitoan?grade=12",
  },
  {
    grade: "THCS",
    titleVI: "Toán THCS (Lớp 6–9)",
    titleEN: "Middle School (Grade 6–9)",
    descVI: "Số học · Đại số · Hình học phẳng · Căn bậc hai · Phương trình",
    descEN: "Arithmetic · Algebra · Plane Geometry · Roots · Equations",
    topicsVI: "24 bài học · 12 đề kiểm tra",
    topicsEN: "24 lessons · 12 practice tests",
    icon: "🧮",
    color: "#34d399",
    badge: "THCS · Lớp 6–9",
    webHref: "/Cacbaitoan?grade=THCS",
  },
];

/**
 * Grade-to-Age map & helper extracted from ProfileScreen (bundle lines 274115–274133)
 */
export const GRADE_AGE_MAP: Record<string, number> = {
  "Lớp 6": 11,
  "Lớp 7": 12,
  "Lớp 8": 13,
  "Lớp 9": 14,
  "Lớp 10": 15,
  "Lớp 11": 16,
  "Lớp 12": 17,
};

export function calculateAgeFromGrade(gradeLabel: string | undefined | null): number | null {
  if (!gradeLabel) return null;
  if (GRADE_AGE_MAP[gradeLabel]) return GRADE_AGE_MAP[gradeLabel];
  const m = String(gradeLabel).match(/(\d+)/);
  if (m) {
    const g = parseInt(m[1], 10);
    if (g >= 1 && g <= 12) return g + 5;
  }
  return null;
}

/**
 * 8 Preset Avatars extracted from ProfileScreen (bundle lines 274135–274150)
 */
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "ghost",
    emoji: "👻",
    labelVI: "Tinh Linh",
    labelEN: "Ghost Spirit",
    bg: "rgba(148,163,184,0.18)",
    border: "#94a3b8",
  },
  {
    id: "scholar",
    emoji: "🎓",
    labelVI: "Học Giả",
    labelEN: "Scholar",
    bg: "rgba(34,211,238,0.18)",
    border: "#22d3ee",
  },
  {
    id: "admin",
    emoji: "👑",
    labelVI: "Quản Trị Viên",
    labelEN: "Admin Crown",
    bg: "rgba(251,191,36,0.22)",
    border: "#fbbf24",
    adminOnly: true,
  },
  {
    id: "robot",
    emoji: "🤖",
    labelVI: "Trí Tuệ AI",
    labelEN: "AI Robot",
    bg: "rgba(168,85,247,0.18)",
    border: "#a855f7",
  },
  {
    id: "fox",
    emoji: "🦊",
    labelVI: "Cáo Thông Thái",
    labelEN: "Clever Fox",
    bg: "rgba(249,115,22,0.18)",
    border: "#f97316",
  },
  {
    id: "astro",
    emoji: "🧑‍🚀",
    labelVI: "Phi Hành Gia",
    labelEN: "Astronaut",
    bg: "rgba(59,130,246,0.18)",
    border: "#3b82f6",
  },
  {
    id: "owl",
    emoji: "🦉",
    labelVI: "Cú Đêm",
    labelEN: "Night Owl",
    bg: "rgba(52,211,153,0.18)",
    border: "#34d399",
  },
  {
    id: "cat",
    emoji: "🐱",
    labelVI: "Mèo Toán Học",
    labelEN: "Math Cat",
    bg: "rgba(244,63,94,0.18)",
    border: "#f43f5e",
  },
];

/**
 * 3-step V1.0 Interface Guide tour extracted from InterfaceGuideModal (bundle lines 262201–262211)
 */
export const INTERFACE_GUIDE_STEPS: InterfaceGuideStep[] = [
  {
    badge: "🤖 TÍNH NĂNG MỚI: BINGMCB GIẤU VIỀN",
    icon: "🎓",
    title: "Trợ Lý AI Tự Động Nép Sát Mép Màn Hình",
    subtitle: "Không còn che khuất bài học — kéo thả tự do tới bất kỳ vị trí nào bạn muốn!",
    color: "#38bdf8",
    bgGlow: "rgba(56, 189, 248, 0.16)",
    bullets: [
      "Khi chưa dùng, nút AI tự động thu gọn thành một thẻ nhỏ sát mép phải hoặc mép trái màn hình.",
      "Nhấn 1 lần để trượt nút ra ngoài, nhấn lần 2 để mở cửa sổ chat gia sư AI BingMCB.",
      "Giữ và kéo (Drag & Drop) tới bất kỳ đâu — thả tay ra nút sẽ tự động hút về mép gần nhất!",
    ],
    visualType: "bingmcb",
  },
  {
    badge: "💧 CÔNG NGHỆ MỚI: APPLE LIQUID GLASS",
    icon: "✨",
    title: "Thanh Điều Hướng Kính Lỏng Đa Chiều",
    subtitle: "Lấy cảm hứng từ Apple visionOS & iOS 26 với hiệu ứng khúc xạ ánh sáng mượt mà.",
    color: "#c084fc",
    bgGlow: "rgba(192, 132, 252, 0.16)",
    bullets: [
      "Thanh Tab Bar nổi lơ lửng với viền phản quang (Specular Rim) và nền kính trong suốt.",
      "Hỗ trợ vuốt ngang mượt mà qua lại giữa 5 chuyên mục: Trang chủ, Học tập, Đấu hạng, Tài liệu, Hồ sơ.",
      "Tùy chỉnh độ trong suốt (Opacity 25% – 100%) theo sở thích cá nhân ngay trong Cài đặt nhanh.",
    ],
    visualType: "liquidglass",
  },
  {
    badge: "⚙️ TRUNG TÂM ĐIỀU KHIỂN: QUICK SETTINGS",
    icon: "🎛️",
    title: "Đổi Giao Diện & Ngôn Ngữ Chỉ Với 1 Chạm",
    subtitle: "Nút Cài Đặt Nhanh (⚙️) luôn sẵn sàng ở góc trên màn hình chính và trang Hồ sơ.",
    color: "#34d399",
    bgGlow: "rgba(52, 211, 153, 0.16)",
    bullets: [
      "Chuyển đổi tức thì giữa Tiếng Việt (🇻🇳) và Tiếng Anh (🇬🇧) trên toàn bộ ứng dụng.",
      "3 chế độ giao diện: Sáng (Light), Tối (Dark) và Kính Lỏng (Liquid Glass).",
      "Thanh trượt chỉnh độ đậm nhạt của hiệu ứng kính và nút xem lại Hướng dẫn này bất cứ lúc nào!",
    ],
    visualType: "quicksettings",
  },
];

/**
 * 4 Quick Suggestion Chips in BingSideBar (bundle lines 284795–284802)
 */
export const BING_MCB_SUGGESTIONS: BingMCBSuggestion[] = [
  {
    vi: "Giải thích định lý Viète và ứng dụng",
    en: "Explain Vieta's formulas and applications",
  },
  {
    vi: "Cách khảo sát sự biến thiên của hàm số bậc 3",
    en: "How to analyze monotonicity of a cubic function",
  },
  {
    vi: "Mẹo tính nhẩm nhanh bình phương và phương trình bậc 2",
    en: "Mental math tricks for squares and quadratic equations",
  },
  {
    vi: "Tổng hợp công thức đạo hàm & nguyên hàm cơ bản",
    en: "Summary of basic derivative & integral formulas",
  },
];

/**
 * 3 MRM Battle Maps extracted from BattleScreen (bundle lines 270848–270853)
 */
export const MRM_MAPS: MRMMap[] = [
  {
    id: "THCS",
    nameVI: "Đấu Trường THCS",
    nameEN: "Middle School Arena",
    descVI: "Số học, Phân số, Đại số cơ bản, Hình học phẳng & Phương trình bậc nhất",
    descEN: "Arithmetic, Fractions, Basic Algebra, Plane Geometry & Linear Equations",
    icon: "🛡️",
    color: "#34d399",
    bgGlow: "rgba(52,211,153,0.14)",
    grades: "Lớp 6 – 9",
    targetQ: 10,
    timeBonus: "+15 XP / câu",
  },
  {
    id: "THPT",
    nameVI: "Đấu Trường THPT",
    nameEN: "High School Arena",
    descVI: "Hàm số, Lượng giác, Đạo hàm, Tích phân, Oxyz & Xác suất thống kê",
    descEN: "Functions, Trigonometry, Derivatives, Integrals, 3D Oxyz & Probability",
    icon: "⚔️",
    color: "#22d3ee",
    bgGlow: "rgba(34,211,238,0.14)",
    grades: "Lớp 10 – 12",
    targetQ: 10,
    timeBonus: "+20 XP / câu",
  },
  {
    id: "THTH",
    nameVI: "Đấu Trường Tổng Hợp",
    nameEN: "Grandmaster Arena",
    descVI: "Thử thách toàn diện từ lớp 6 đến lớp 12 với câu hỏi tư duy tốc độ cao",
    descEN: "Comprehensive challenge across Grades 6–12 with high-speed logic problems",
    icon: "👑",
    color: "#fbbf24",
    bgGlow: "rgba(251,191,36,0.16)",
    grades: "Lớp 6 – 12 (All-Star)",
    targetQ: 12,
    timeBonus: "+25 XP / câu",
  },
];

export const LEADERBOARD_FILTERS: LeaderboardFilter[] = [
  { labelVI: "Tất cả", labelEN: "All", value: null },
  { labelVI: "Lớp 10", labelEN: "G10", value: 10 },
  { labelVI: "Lớp 11", labelEN: "G11", value: 11 },
  { labelVI: "Lớp 12", labelEN: "G12", value: 12 },
];
