const fs = require('fs');
const path = require('path');

const dir = 'c:\\\\Users\\\\Latitude 7300\\\\OneDrive\\\\Máy tính\\\\duosteam - Copy\\\\duosteam\\\\frontend\\\\src\\\\components\\\\Cacbaitoan10';

const files = fs.readdirSync(dir).filter(f => (f.startsWith('Lesson') || f.startsWith('OnTapChuong')) && f.endsWith('.js') && f !== 'LessonVideoPlayer.js');

const subtitlesCode = `
  const videoSubtitles = [
    {
      start: 0, end: 5,
      words: [
        { text: "Welcome", vi: "Chào mừng" },
        { text: "to", vi: "đến với" },
        { text: "this", vi: "bài" },
        { text: "lesson.", vi: "học." }
      ]
    }
  ];
`;

const videoSectionCode = `
        {/* ════════════════════════════════════════
            VIDEO BÀI GIẢNG
        ════════════════════════════════════════ */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div className="reveal" data-reveal>
            <LessonVideoPlayer
              videoId="8Rz77E7rYHI"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
            />
          </div>
        </section>
`;

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  if (content.includes('LessonVideoPlayer')) {
    console.log('Skipping', file, 'already updated');
    continue;
  }

  // 1. Add import
  if (content.includes('import DuoTranslate from "../DuoMCB/DuoTranslate";')) {
    content = content.replace(
      'import DuoTranslate from "../DuoMCB/DuoTranslate";',
      'import DuoTranslate from "../DuoMCB/DuoTranslate";\\nimport LessonVideoPlayer from "./LessonVideoPlayer";'
    );
  }

  // 2. Add videoSubtitles
  if (content.includes('  const toggleAnswer = ')) {
    content = content.replace(
      '  const toggleAnswer = ',
      subtitlesCode + '\\n  const toggleAnswer = '
    );
  }

  // 3. Add to tabs
  content = content.replace(
    '["khoiDong", "🚀", t("Khởi động", "Warm-Up")],',
    '["khoiDong", "🚀", t("Khởi động", "Warm-Up")],\\n    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],'
  );

  // 4. Add video section
  const khoiDongIdx = content.indexOf('id="khoiDong"');
  if (khoiDongIdx !== -1) {
    const endSectionIdx = content.indexOf('</section>', khoiDongIdx);
    if (endSectionIdx !== -1) {
       const insertIdx = endSectionIdx + '</section>'.length;
       content = content.slice(0, insertIdx) + '\\n' + videoSectionCode + content.slice(insertIdx);
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Updated', file);
  updatedCount++;
}

console.log('Total files updated:', updatedCount);
