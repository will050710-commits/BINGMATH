"use client";
import React from "react";

// Pixel art style colors
const COLORS = {
  pink: "#f43f5e",
  darkPink: "#be123c",
  lightPink: "#fda4af",
  purple: "#a855f7",
  darkPurple: "#7e22ce",
  lightPurple: "#d8b4fe",
  blue: "#3b82f6",
  darkBlue: "#1d4ed8",
  lightBlue: "#93c5fd",
  cyan: "#22d3ee",
  darkCyan: "#0891b2",
  lightCyan: "#cffafe",
  orange: "#f97316",
  darkOrange: "#c2410c",
  lightOrange: "#fed7aa",
  yellow: "#fbbf24",
  darkYellow: "#d97706",
  lightYellow: "#fef08a",
  grey: "#94a3b8",
  darkGrey: "#475569",
  lightGrey: "#cbd5e1",
  white: "#ffffff",
  black: "#0f172a",
};

// 1. PIN (Ghim)
export function IconPin({ size = 28, color }) {
  const pinColor = color || COLORS.pink;
  const shadowColor = COLORS.darkPink;
  const highlightColor = COLORS.lightPink;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: "pixelated" }}>
      {/* Pin head shadow */}
      <circle cx="16" cy="13" r="8" fill={shadowColor} />
      {/* Pin head main */}
      <circle cx="16" cy="12" r="7" fill={pinColor} />
      {/* Highlight */}
      <circle cx="13" cy="9" r="2" fill={highlightColor} />
      {/* Pin stem */}
      <rect x="15" y="19" width="2" height="9" fill={COLORS.grey} />
      {/* Stem tip */}
      <polygon points="15,28 17,28 16,30" fill={COLORS.darkGrey} />
      {/* Connection cap */}
      <rect x="13" y="19" width="6" height="2" fill={COLORS.lightGrey} />
    </svg>
  );
}

// 2. THƯ (@)
export function IconMail({ size = 28, color }) {
  const accentColor = color || COLORS.blue;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Envelope Body */}
      <rect x="3" y="7" width="26" height="18" rx="2" fill={COLORS.lightOrange} stroke={COLORS.darkOrange} strokeWidth="2" />
      {/* Flap lines */}
      <path d="M4 8 L16 17 L28 8" stroke={COLORS.darkOrange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 24 L11 16" stroke={COLORS.darkOrange} strokeWidth="2" strokeLinecap="round" />
      <path d="M28 24 L21 16" stroke={COLORS.darkOrange} strokeWidth="2" strokeLinecap="round" />
      {/* Blue @ Symbol */}
      <circle cx="16" cy="16" r="4" fill={COLORS.white} stroke={accentColor} strokeWidth="1.5" />
      <path d="M17 14 C17 13 15 13 15 15 C15 17 17 17 17 15" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 3. ĐIỆN THOẠI
export function IconPhone({ size = 28, color }) {
  const phoneColor = color || COLORS.pink;
  const accentColor = COLORS.darkPink;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Curly Cord on the Left */}
      <path d="M6 16 C4 16 4 19 6 20 C8 21 8 23 6 24" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      {/* Phone Base */}
      <path d="M8 26 L24 26 C26 26 26 21 24 16 L8 16 C6 21 6 26 8 26 Z" fill={phoneColor} stroke={accentColor} strokeWidth="2" />
      {/* Keypad Grid (3x3 dots) */}
      <rect x="12" y="19" width="2" height="2" fill={COLORS.white} />
      <rect x="15" y="19" width="2" height="2" fill={COLORS.white} />
      <rect x="18" y="19" width="2" height="2" fill={COLORS.white} />
      <rect x="12" y="22" width="2" height="2" fill={COLORS.white} />
      <rect x="15" y="22" width="2" height="2" fill={COLORS.white} />
      <rect x="18" y="22" width="2" height="2" fill={COLORS.white} />
      {/* Handset on Top */}
      <path d="M6 13 L26 13" stroke={phoneColor} strokeWidth="5" strokeLinecap="round" />
      <path d="M6 11 L6 14" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M26 11 L26 14" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
      {/* Highlight on Handset */}
      <line x1="9" y1="13" x2="23" y2="13" stroke={COLORS.lightPink} strokeWidth="1.5" />
    </svg>
  );
}

// 4. SÁCH
export function IconBooks({ size = 28, color }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Book 1 (Purple - Spine left) */}
      <rect x="4" y="6" width="6" height="20" rx="1" fill={COLORS.purple} stroke={COLORS.darkPurple} strokeWidth="1.5" />
      <line x1="4" y1="10" x2="10" y2="10" stroke={COLORS.white} strokeWidth="1.5" />
      <line x1="4" y1="14" x2="10" y2="14" stroke={COLORS.white} strokeWidth="1.5" />
      {/* Book 2 (Blue - Middle) */}
      <rect x="11" y="8" width="7" height="18" rx="1" fill={COLORS.blue} stroke={COLORS.darkBlue} strokeWidth="1.5" />
      <line x1="11" y1="12" x2="18" y2="12" stroke={COLORS.white} strokeWidth="1.5" />
      <line x1="11" y1="16" x2="18" y2="16" stroke={COLORS.white} strokeWidth="1.5" />
      {/* Book 3 (Orange - Leaning right) */}
      <g transform="rotate(15 22 18)">
        <rect x="19" y="4" width="6" height="21" rx="1" fill={COLORS.orange} stroke={COLORS.darkOrange} strokeWidth="1.5" />
        <line x1="19" y1="9" x2="25" y2="9" stroke={COLORS.white} strokeWidth="1.5" />
        <line x1="19" y1="13" x2="25" y2="13" stroke={COLORS.white} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// 5. KIẾM CHÉO
export function IconSwords({ size = 28, color }) {
  const shieldColor = color || COLORS.blue;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Blue Shield in background */}
      <path d="M16 4 C22 4 25 7 25 14 C25 21 21 26 16 29 C11 26 7 21 7 14 C7 7 10 4 16 4 Z" fill={shieldColor} stroke={COLORS.darkBlue} strokeWidth="2" />
      {/* Shield inner trim */}
      <path d="M16 6 C20.5 6 23 8.5 23 14 C23 19.5 19.5 24 16 26.5 C12.5 24 9 19.5 9 14 C9 8.5 11.5 6 16 6 Z" fill="none" stroke={COLORS.lightBlue} strokeWidth="1" opacity="0.6" />
      
      {/* Sword 1: Top-Left to Bottom-Right */}
      <g transform="translate(16 16) rotate(45) translate(-16 -16)">
        {/* Blade */}
        <rect x="15" y="3" width="2" height="18" fill={COLORS.lightGrey} stroke={COLORS.darkGrey} strokeWidth="1" />
        {/* Hilt / Crossguard */}
        <rect x="12" y="21" width="8" height="2" rx="0.5" fill={COLORS.orange} stroke={COLORS.darkOrange} strokeWidth="0.5" />
        {/* Handle */}
        <rect x="15" y="23" width="2" height="5" fill={COLORS.darkOrange} />
        {/* Pommel */}
        <circle cx="16" cy="29" r="1.5" fill={COLORS.yellow} />
      </g>

      {/* Sword 2: Top-Right to Bottom-Left */}
      <g transform="translate(16 16) rotate(-45) translate(-16 -16)">
        {/* Blade */}
        <rect x="15" y="3" width="2" height="18" fill={COLORS.lightGrey} stroke={COLORS.darkGrey} strokeWidth="1" />
        {/* Hilt / Crossguard */}
        <rect x="12" y="21" width="8" height="2" rx="0.5" fill={COLORS.orange} stroke={COLORS.darkOrange} strokeWidth="0.5" />
        {/* Handle */}
        <rect x="15" y="23" width="2" height="5" fill={COLORS.darkOrange} />
        {/* Pommel */}
        <circle cx="16" cy="29" r="1.5" fill={COLORS.yellow} />
      </g>
    </svg>
  );
}

// 6. TÊN LỬA
export function IconRocket({ size = 28, color }) {
  const bodyColor = color || COLORS.pink;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flame trail (thrust) */}
      <polygon points="5,27 12,24 8,20" fill={COLORS.yellow} />
      <polygon points="4,28 9,26 7,24" fill={COLORS.orange} />

      {/* Rocket Body Leaning Up-Right */}
      <g transform="translate(16 16) rotate(45) translate(-16 -16)">
        {/* Rocket Body */}
        <path d="M13 6 C13 6 13 3 16 3 C19 3 19 6 19 6 L19 22 L13 22 Z" fill={bodyColor} stroke={COLORS.darkPink} strokeWidth="1.5" />
        {/* Purple Nosecone */}
        <path d="M13 6 C13 6 13 3 16 3 C19 3 19 6 19 6 Z" fill={COLORS.purple} />
        {/* Fins (left and right) */}
        <path d="M13 18 L8 22 L13 22 Z" fill={COLORS.purple} stroke={COLORS.darkPurple} strokeWidth="1.5" />
        {/* Right Fin */}
        <path d="M19 18 L24 22 L19 22 Z" fill={COLORS.purple} stroke={COLORS.darkPurple} strokeWidth="1.5" />
        {/* Center Fin */}
        <rect x="15" y="16" width="2" height="6" fill={COLORS.darkPurple} />
        {/* Circular glass window */}
        <circle cx="16" cy="11" r="2.5" fill={COLORS.lightCyan} stroke={COLORS.darkBlue} strokeWidth="1" />
        <circle cx="15" cy="10" r="1" fill={COLORS.white} />
      </g>
    </svg>
  );
}

// 7. ĐẦU RÔ BỐT
export function IconRobot({ size = 28, color }) {
  const headColor = color || COLORS.lightPurple;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Antennae */}
      <line x1="11" y1="7" x2="9" y2="4" stroke={COLORS.grey} strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="7" x2="23" y2="4" stroke={COLORS.grey} strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="3" r="2" fill={COLORS.cyan} />
      <circle cx="24" cy="3" r="2" fill={COLORS.cyan} />

      {/* Ears / Side bolts */}
      <rect x="3" y="13" width="2" height="6" rx="0.5" fill={COLORS.grey} />
      <rect x="27" y="13" width="2" height="6" rx="0.5" fill={COLORS.grey} />

      {/* Head block */}
      <rect x="5" y="7" width="22" height="18" rx="3" fill={headColor} stroke={COLORS.darkPurple} strokeWidth="2" />

      {/* Eyes (Glowing cyan circles) */}
      <circle cx="11" cy="14" r="3" fill={COLORS.white} stroke={COLORS.cyan} strokeWidth="2" />
      <circle cx="21" cy="14" r="3" fill={COLORS.white} stroke={COLORS.cyan} strokeWidth="2" />
      {/* Pupil sparks */}
      <circle cx="11.5" cy="13.5" r="1" fill={COLORS.cyan} />
      <circle cx="21.5" cy="13.5" r="1" fill={COLORS.cyan} />

      {/* Mouth */}
      <path d="M12 20 Q16 23 20 20" stroke={COLORS.darkPurple} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 8. KÍNH LÚP
export function IconSearch({ size = 28, color }) {
  const lensColor = color || COLORS.cyan;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Handle */}
      <rect x="21" y="21" width="4" height="10" rx="1" transform="rotate(-45 21 21)" fill={COLORS.darkGrey} stroke={COLORS.black} strokeWidth="1.5" />
      {/* Metallic neck */}
      <rect x="18" y="18" width="3" height="4" transform="rotate(-45 18 18)" fill={COLORS.lightGrey} />

      {/* Glass frame */}
      <circle cx="12" cy="12" r="8" fill={lensColor} stroke={COLORS.darkGrey} strokeWidth="2.5" />
      {/* Lens reflection shine */}
      <circle cx="9" cy="9" r="2" fill={COLORS.white} opacity="0.6" />
      {/* Retro stars inside glass */}
      <polygon points="15,9 16,11 18,11 16,12 17,14 15,13 13,14 14,12 12,11 14,11" fill={COLORS.white} opacity="0.8" />
    </svg>
  );
}

// 9. MÁY CHƠI GAME
export function IconGamepad({ size = 28, color }) {
  const consoleColor = color || COLORS.lightGrey;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Handheld Case */}
      <rect x="6" y="3" width="20" height="26" rx="3" fill={consoleColor} stroke={COLORS.darkGrey} strokeWidth="2" />
      
      {/* Screen area */}
      <rect x="9" y="6" width="14" height="10" fill={COLORS.black} rx="1" />
      {/* Game Screen */}
      <rect x="10" y="7" width="12" height="8" fill={COLORS.cyan} />
      {/* Active game spark line */}
      <path d="M11 13 L14 10 L17 12 L21 8" stroke={COLORS.white} strokeWidth="1.2" strokeLinecap="round" />
      {/* Power LED */}
      <circle cx="8.5" cy="11" r="0.75" fill={COLORS.pink} />

      {/* D-Pad (Left side) */}
      <path d="M12 18 H14 V20 H12 Z" fill={COLORS.darkGrey} />
      <path d="M10 20 H16 V22 H10 Z" fill={COLORS.darkGrey} />
      <path d="M12 22 H14 V24 H12 Z" fill={COLORS.darkGrey} />

      {/* Action Buttons (Right side) */}
      <circle cx="22" cy="19.5" r="1.5" fill={COLORS.pink} stroke={COLORS.darkPink} strokeWidth="0.5" />
      <circle cx="19" cy="22" r="1.5" fill={COLORS.yellow} stroke={COLORS.darkYellow} strokeWidth="0.5" />

      {/* Slanted menu buttons at bottom */}
      <rect x="12" y="26" width="3" height="1" rx="0.2" fill={COLORS.grey} transform="skewX(-20)" />
      <rect x="17" y="26" width="3" height="1" rx="0.2" fill={COLORS.grey} transform="skewX(-20)" />
    </svg>
  );
}

// 10. BÀI TEST
export function IconTest({ size = 28, color }) {
  const paperColor = COLORS.white;
  const gradeColor = color || COLORS.pink;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Paper Sheet */}
      <path d="M5 4 L21 4 L27 10 L27 28 C27 29 26 30 25 30 L5 30 C4 30 3 29 3 28 L3 6 C3 5 4 4 5 4 Z" fill={paperColor} stroke={COLORS.grey} strokeWidth="2" />
      {/* Folded corner */}
      <path d="M21 4 L21 10 L27 10 Z" fill={COLORS.lightGrey} stroke={COLORS.grey} strokeWidth="1.5" />

      {/* Line markings */}
      <line x1="6" y1="10" x2="16" y2="10" stroke={COLORS.lightGrey} strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="14" x2="23" y2="14" stroke={COLORS.lightGrey} strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="18" x2="23" y2="18" stroke={COLORS.lightGrey} strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="22" x2="19" y2="22" stroke={COLORS.lightGrey} strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="26" x2="15" y2="26" stroke={COLORS.lightGrey} strokeWidth="2" strokeLinecap="round" />

      {/* Grade Stamp (A+ in circled red) */}
      <circle cx="21" cy="22" r="5" fill={COLORS.white} stroke={gradeColor} strokeWidth="1.5" />
      <text x="21" y="23" fill={gradeColor} fontSize="6" fontWeight="bold" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">A+</text>

      {/* Gold star at bottom right */}
      <g transform="translate(24 23) scale(0.25)">
        <polygon points="12,0 15,9 24,9 17,14 20,23 12,18 4,23 7,14 0,9 9,9" fill={COLORS.yellow} stroke={COLORS.darkYellow} strokeWidth="2" />
      </g>
    </svg>
  );
}

// Map mapping standard icons and emojis to Custom SVG Components
const ICON_REGISTRY = {
  // Pin mappings
  "📍": IconPin,
  "📌": IconPin,
  "pin": IconPin,
  "ghim": IconPin,

  // Mail mappings
  "📧": IconMail,
  "✉️": IconMail,
  "✉": IconMail,
  "mail": IconMail,
  "email": IconMail,
  "thu": IconMail,

  // Phone mappings
  "☎️": IconPhone,
  "📞": IconPhone,
  "phone": IconPhone,
  "dienthoai": IconPhone,

  // Book mappings
  "📖": IconBooks,
  "📚": IconBooks,
  "books": IconBooks,
  "sach": IconBooks,

  // Sword mappings
  "⚔️": IconSwords,
  "swords": IconSwords,
  "kiem": IconSwords,

  // Rocket mappings
  "🚀": IconRocket,
  "rocket": IconRocket,
  "tenlua": IconRocket,

  // Robot mappings
  "🤖": IconRobot,
  "robot": IconRobot,

  // Search / Lookup mappings
  "🔍": IconSearch,
  "🔎": IconSearch,
  "search": IconSearch,
  "kinhlup": IconSearch,

  // Game mappings
  "🎮": IconGamepad,
  "🧩": IconGamepad,
  "game": IconGamepad,
  "gamepad": IconGamepad,

  // Test / Pencil mappings
  "✏️": IconTest,
  "📝": IconTest,
  "✍️": IconTest,
  "🃏": IconTest,
  "test": IconTest,
  "baitest": IconTest,

  // Tool / Pin mappings
  "🛠️": IconPin,

  // Energy / speed mappings
  "⚡": IconRocket,
};

/**
 * Renders the custom vector pixel-art style SVG corresponding to a given emoji or name string.
 * Fallbacks to rendering the input emoji string if no matching component is found.
 */
export function renderDuoIcon(emojiOrName, props = {}) {
  if (!emojiOrName) return null;
  
  const key = typeof emojiOrName === "string" ? emojiOrName.trim() : "";
  const IconComponent = ICON_REGISTRY[key];
  
  if (IconComponent) {
    return <IconComponent {...props} />;
  }
  
  // Fallback to text string if not registered
  return <span style={{ fontSize: props.size || 20 }}>{emojiOrName}</span>;
}
