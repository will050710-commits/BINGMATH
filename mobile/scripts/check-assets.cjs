const fs = require('node:fs');
const path = require('node:path');

// Android's resource compiler rejects JPEG bytes named .png. Check before Gradle.
const signatures = {
  '.png': bytes => bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
  '.jpg': bytes => bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')),
  '.jpeg': bytes => bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')),
  '.webp': bytes => bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
};
let count = 0;
function check(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      check(filename);
    } else {
      const validate = signatures[path.extname(filename).toLowerCase()];
      if (validate) {
        count++;
        if (!validate(fs.readFileSync(filename))) {
          throw new Error(`Image extension does not match its contents: ${filename}`);
        }
      }
    }
  }
}
check(path.resolve(__dirname, '../src/assets'));
check(path.resolve(__dirname, '../android/app/src/main/res'));
console.log(`Validated ${count} packaged image assets.`);
