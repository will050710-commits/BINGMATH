const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../frontend/src/components/Cacbaitoan10');
if (!fs.existsSync(dir)) {
    console.error("Directory not found:", dir);
    process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

let count = 0;
files.forEach(filename => {
    const filepath = path.join(dir, filename);
    let content = fs.readFileSync(filepath, 'utf8');
    
    if (content.includes('<Link') && !content.includes('import Link from')) {
        console.log(`Fixing Link import in: ${filename}`);
        
        // Find "use client"; and insert right after it
        const index = content.indexOf('"use client";');
        if (index !== -1) {
            const insertPos = index + '"use client";'.length;
            content = content.slice(0, insertPos) + '\nimport Link from "next/link";' + content.slice(insertPos);
        } else {
            content = 'import Link from "next/link";\n' + content;
        }
        
        fs.writeFileSync(filepath, content, 'utf8');
        count++;
    }
});

console.log(`Successfully fixed ${count} files!`);
