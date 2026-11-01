const {spawnSync} = require('node:child_process');
const path = require('node:path');

const tasks = {
  debug: ['assembleDebug'],
  preview: ['assemblePreview'],
  release: ['assembleRelease', 'bundleRelease'],
};
const variant = process.argv[2];
if (!tasks[variant]) {
  throw new Error('Usage: node scripts/android-build.cjs debug|preview|release');
}
const result = spawnSync(
  process.platform === 'win32' ? '.\\gradlew.bat' : './gradlew',
  [...tasks[variant], '--no-daemon', ...process.argv.slice(3)],
  {
    cwd: path.resolve(__dirname, '../android'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);
if (result.error) {
  console.error(result.error.message);
}
process.exit(result.status ?? 1);
