const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const scratchDir = __dirname;
const duosteamDir = path.join(scratchDir, '..');
const enginePath = path.join(duosteamDir, 'frontend/src/components/Cacbaitoan10/PremiumLessonEngine.js');

// 1. Get original file content from HEAD
console.log("Retrieving clean HEAD version of PremiumLessonEngine.js...");
let content = execSync('git show HEAD:frontend/src/components/Cacbaitoan10/PremiumLessonEngine.js', { cwd: duosteamDir, encoding: 'utf8' });

// Normalize line endings to LF
content = content.replace(/\r\n/g, '\n');

// Helper to cleanly unescape double-escaped JSON strings
function cleanString(str) {
  if (!str) return '';
  let val = str;
  // If it has outer quotes, parse it as a JSON string to decode escapes
  if (val.startsWith('"') && val.endsWith('"')) {
    try {
      val = JSON.parse(val);
    } catch (e) {
      val = val.substring(1, val.length - 1);
    }
  }
  // Fallback replacements for raw escapes
  return val
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

// 2. Find all extracted replacement JSON files
const files = fs.readdirSync(scratchDir)
  .filter(f => f.startsWith('extracted_write_') && f.endsWith('.txt'))
  .map(f => {
    const parts = f.split('_');
    const step = parseInt(parts[2], 10);
    return { step, file: f };
  })
  .sort((a, b) => a.step - b.step);

console.log(`Found ${files.length} replacement steps to apply in order:`, files.map(x => x.step));

for (const item of files) {
  console.log(`Applying step ${item.step} (${item.file})...`);
  const data = JSON.parse(fs.readFileSync(path.join(scratchDir, item.file), 'utf8'));
  
  if (data.ReplacementChunks) {
    // Multi replacement
    for (const chunk of data.ReplacementChunks) {
      let target = cleanString(chunk.TargetContent).replace(/\r\n/g, '\n');
      let replacement = cleanString(chunk.ReplacementContent).replace(/\r\n/g, '\n');
      if (!content.includes(target)) {
        console.warn(`  Warning: Target content not found in step ${item.step}!`);
      } else {
        content = content.replace(target, replacement);
        console.log(`  Successfully replaced chunk.`);
      }
    }
  } else if (data.TargetContent) {
    // Single replacement
    let target = cleanString(data.TargetContent).replace(/\r\n/g, '\n');
    let replacement = cleanString(data.ReplacementContent).replace(/\r\n/g, '\n');
    if (!content.includes(target)) {
      console.warn(`  Warning: Target content not found in step ${item.step}!`);
    } else {
      content = content.replace(target, replacement);
      console.log(`  Successfully replaced single block.`);
    }
  }
}

// Convert line endings back to CRLF for Windows compatibility
content = content.replace(/\n/g, '\r\n');

// 3. Save reconstructed content back to the component file
fs.writeFileSync(enginePath, content, 'utf8');
console.log(`Successfully reconstructed PremiumLessonEngine.js at ${enginePath}!`);
