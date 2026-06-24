const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:\\Users\\Latitude 7300\\.gemini\\antigravity-ide\\brain\\11434a7e-7b89-46c5-956a-7c9f9f1343bc\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

console.log(`Analyzing ${lines.length} lines for writes...`);
let foundCount = 0;

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const data = JSON.parse(line);
    
    // Check tool calls
    if (data.tool_calls) {
      for (const call of data.tool_calls) {
        const target = call.args?.TargetFile || call.args?.AbsolutePath || "";
        if (target.includes('PremiumLessonEngine.js')) {
          console.log(`Step ${data.step_index}: Tool=${call.name}`);
          if (call.name === 'write_to_file' || call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') {
            foundCount++;
            const outPath = path.join(__dirname, `extracted_write_${data.step_index}_${call.name}.txt`);
            fs.writeFileSync(outPath, JSON.stringify(call.args, null, 2));
            console.log(`  Saved write args to: ${outPath}`);
          }
        }
      }
    }
  } catch (err) {}
}

console.log(`Scan complete. Found ${foundCount} write actions.`);
