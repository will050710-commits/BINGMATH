const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../frontend/src/components/Cacbaitoan10');
if (!fs.existsSync(dir)) {
    console.error("Directory not found:", dir);
    process.exit(1);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

const replacements = [
    // Backgrounds
    { regex: /background:\s*["']#f9f9f9["']/gi, replacement: 'background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)"' },
    { regex: /background:\s*["']white["']/gi, replacement: 'background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)"' },
    { regex: /background:\s*["']#fff["']/gi, replacement: 'background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)"' },
    { regex: /background:\s*["']black["']/gi, replacement: 'background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)"' },
    
    // Pastels
    { regex: /#eaf4fb/gi, replacement: 'rgba(14, 165, 233, 0.15)' },
    { regex: /#eafaf1/gi, replacement: 'rgba(16, 185, 129, 0.15)' },
    { regex: /#fdf2f2/gi, replacement: 'rgba(239, 68, 68, 0.15)' },
    { regex: /#f5eef8/gi, replacement: 'rgba(168, 85, 247, 0.15)' },
    { regex: /#fff3cd/gi, replacement: 'rgba(245, 158, 11, 0.15)' },
    { regex: /#e8f8f5/gi, replacement: 'rgba(20, 184, 166, 0.15)' },

    // Text colors (Dark to Light/Glowing)
    { regex: /color:\s*["']#555["']/gi, replacement: 'color: "rgba(255, 255, 255, 0.7)"' },
    { regex: /color:\s*["']#777["']/gi, replacement: 'color: "rgba(255, 255, 255, 0.5)"' },
    { regex: /color:\s*["']#333["']/gi, replacement: 'color: "rgba(255, 255, 255, 0.9)"' },
    { regex: /color:\s*["']#0B4F5C["']/gi, replacement: 'color: "#22d3ee"' },
    { regex: /#1a5276/gi, replacement: '#38bdf8' },
    { regex: /#1e8449/gi, replacement: '#4ade80' },
    { regex: /#922b21/gi, replacement: '#f87171' },
    { regex: /#6c3483/gi, replacement: '#c084fc' },
    { regex: /#856404/gi, replacement: '#fbbf24' },
    { regex: /#0B4F5C/gi, replacement: '#22d3ee' }, // Catch raw string constants
    { regex: /#555555/gi, replacement: 'rgba(255, 255, 255, 0.7)' },
    { regex: /#333333/gi, replacement: 'rgba(255, 255, 255, 0.9)' },

    // Borders
    { regex: /border:\s*["']1px solid #eee["']/gi, replacement: 'border: "1px solid rgba(255, 255, 255, 0.08)"' },
    { regex: /border:\s*["']1px solid #ddd["']/gi, replacement: 'border: "1px solid rgba(255, 255, 255, 0.08)"' }
];

let count = 0;
files.forEach(filename => {
    const filepath = path.join(dir, filename);
    let original = fs.readFileSync(filepath, 'utf8');
    let content = original;
    
    replacements.forEach(r => {
        content = content.replace(r.regex, r.replacement);
    });
    
    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Refactored styles in: ${filename}`);
        count++;
    }
});

console.log(`Successfully refactored styling in ${count} files!`);
