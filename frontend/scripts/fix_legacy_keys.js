const fs = require("fs");
const path = require("path");

const bailamDir = path.join(__dirname, "..", "src", "components", "bailam");
const sectionFile = /^L(?:10|11)-test\d-section[123]\.js$/;

function expectedLegacyKey(fileName, content) {
  const sectionMatch = fileName.match(/section[123]/);
  const testKeyMatch = content.match(/const\s+TEST_KEY\s*=\s*["']([^"']+)["']/);

  if (!sectionMatch || !testKeyMatch) {
    throw new Error(`Cannot derive TEST_KEY/SECTION for ${fileName}`);
  }

  return `${testKeyMatch[1]}_${sectionMatch[0]}`;
}

const files = fs.readdirSync(bailamDir).filter((file) => sectionFile.test(file));
let changed = 0;

for (const file of files) {
  const fullPath = path.join(bailamDir, file);
  const content = fs.readFileSync(fullPath, "utf8");
  const legacyMatch = content.match(/const\s+LEGACY_KEY\s*=\s*["']([^"']+)["']/);

  if (!legacyMatch) {
    throw new Error(`Missing LEGACY_KEY in ${file}`);
  }

  const expected = expectedLegacyKey(file, content);
  if (legacyMatch[1] === expected) {
    continue;
  }

  const next = content.replace(
    /const\s+LEGACY_KEY\s*=\s*["'][^"']+["']/,
    `const LEGACY_KEY = "${expected}"`
  );
  fs.writeFileSync(fullPath, next, "utf8");
  changed += 1;
}

const seen = new Map();
for (const file of files) {
  const content = fs.readFileSync(path.join(bailamDir, file), "utf8");
  const key = content.match(/const\s+LEGACY_KEY\s*=\s*["']([^"']+)["']/)?.[1];
  if (seen.has(key)) {
    throw new Error(`Duplicate LEGACY_KEY "${key}" in ${seen.get(key)} and ${file}`);
  }
  seen.set(key, file);
}

console.log(`Checked ${files.length} bailam section files; updated ${changed}; duplicate keys: 0.`);
