const fs = require('fs');
const path = require('path');

const dir = 'c:\\\\Users\\\\Latitude 7300\\\\OneDrive\\\\Máy tính\\\\duosteam - Copy\\\\duosteam\\\\frontend\\\\src\\\\components\\\\Cacbaitoan10';

const files = fs.readdirSync(dir).filter(f => (f.startsWith('Lesson') || f.startsWith('OnTapChuong')) && f.endsWith('.js') && f !== 'LessonVideoPlayer.js');

let count = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace literal '\n' with actual newline where it was mistakenly inserted
  if (content.includes('\\n')) {
    // Only replace the ones we injected. Let's just do a global replace of '\\n' with actual newline
    // But wait, there might be legitimate '\\n' in strings!
    // So let's only target the specific ones:
    content = content.replace('DuoTranslate";\\nimport', 'DuoTranslate";\nimport');
    content = content.replace('];\\n\\n  const toggleAnswer = ', '];\n\n  const toggleAnswer = ');
    content = content.replace('];\\n  const toggleAnswer = ', '];\n  const toggleAnswer = ');
    content = content.replace('Warm-Up")],\\n    ["videoBaiGiang"', 'Warm-Up")],\n    ["videoBaiGiang"');
    content = content.replace('</section>\\n        {/* ════', '</section>\n        {/* ════');
    
    // We can also just use regex to replace literal \n if it's outside strings, 
    // but the above specific replaces are safer.
    // Let's do a more robust one for the video section
    content = content.replace(/\\n\s*\{\/\* ════/g, '\n        {/* ════');
    content = content.replace(/\\n\s*const toggleAnswer/g, '\n  const toggleAnswer');
    content = content.replace(/\\n\s*\["videoBaiGiang"/g, '\n    ["videoBaiGiang"');
    content = content.replace(/";\\nimport Lesson/g, '";\nimport Lesson');
    
    fs.writeFileSync(filePath, content, 'utf-8');
    count++;
  }
}
console.log('Fixed', count, 'files.');
