#!/usr/bin/env node
/** Build the checked-in Vietnamese change report without remote fonts/assets. */
import { mkdir, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { marked } from "marked";
import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const input = path.join(repositoryRoot, "docs/CHANGELOG_PERFORMANCE.md");
const output = path.join(repositoryRoot, "docs/CHANGELOG_PERFORMANCE.pdf");
const markdown = await readFile(input, "utf8");
const content = await marked.parse(markdown, { gfm: true, breaks: false });
const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<title>BINGMATH — TutorWorkspace: thay đổi và hiệu năng</title>
<style>
  @page { size: A4; }
  * { box-sizing: border-box; }
  body { color: #18232e; font-family: "DejaVu Sans", "Noto Sans", Arial, sans-serif;
    font-size: 9.4pt; line-height: 1.52; margin: 0; }
  h1 { color: #0e5161; font-size: 23pt; line-height: 1.17; margin: 0 0 14pt; }
  h2 { color: #0e5161; font-size: 14pt; margin: 22pt 0 9pt; }
  h3 { color: #263746; font-size: 11pt; margin: 15pt 0 7pt; }
  h1, h2, h3 { break-after: avoid; }
  p { margin: 0 0 9pt; orphans: 3; widows: 3; }
  a { color: #126579; text-decoration: none; overflow-wrap: anywhere; }
  code { font-family: "DejaVu Sans Mono", "Liberation Mono", monospace; font-size: 8.1pt;
    background: #eff3f5; border-radius: 3px; padding: 1px 3px; overflow-wrap: anywhere; }
  pre { padding: 11pt; margin: 9pt 0; background: #eff3f5; border-left: 3px solid #22798a;
    white-space: pre-wrap; overflow-wrap: anywhere; break-inside: avoid; }
  pre code { padding: 0; background: transparent; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 10pt 0 15pt; font-size: 8.2pt; }
  thead { display: table-header-group; }
  th { text-align: left; color: #0e5161; background: #eaf2f3; font-weight: 700; }
  table:has(th:nth-child(3)) th:nth-child(1) { width: 14%; }
  table:has(th:nth-child(3)) th:nth-child(2) { width: 42%; }
  table:has(th:nth-child(3)) th:nth-child(3) { width: 44%; }
  table:not(:has(th:nth-child(3))) th:nth-child(1) { width: 32%; }
  td, th { padding: 7pt; border: 1px solid #d4dfe3; vertical-align: top; overflow-wrap: anywhere; }
  tr { break-inside: avoid; }
  table code { font-size: 7.3pt; background: transparent; padding: 0; }
  ul, ol { padding-left: 19pt; margin: 7pt 0 11pt; }
  li { margin-bottom: 4pt; }
  blockquote { margin: 10pt 0; padding: 8pt 12pt; background: #f4f7f8; border-left: 3px solid #8fb7c1; }
  blockquote p:last-child { margin-bottom: 0; }
  hr { border: 0; border-top: 1px solid #d4dfe3; margin: 16pt 0; }
</style></head><body>${content}</body></html>`;

await mkdir(path.dirname(output), { recursive: true });
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ javaScriptEnabled: false });
  // The report is self-contained. Avoid silently depending on a remote asset
  // if a future Markdown edit introduces a URL-backed image or stylesheet.
  await page.route(/^https?:\/\//, (route) => route.abort());
  await page.setContent(html, { waitUntil: "load" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: output,
    format: "A4",
    printBackground: true,
    tagged: true,
    outline: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="width:100%;font-size:8px;color:#687b86;padding:0 17mm;font-family:Arial">BINGMATH · TutorWorkspace · Phase A</div>',
    footerTemplate: '<div style="width:100%;font-size:8px;color:#687b86;padding:0 17mm;display:flex;justify-content:space-between;font-family:Arial"><span>Change report · 29/10/2026</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    margin: { top: "19mm", right: "17mm", bottom: "18mm", left: "17mm" },
  });
  const { size } = await stat(output);
  console.log(`PDF created: ${output} (${size.toLocaleString("en-US")} bytes)`);
} catch (error) {
  console.error("Could not build TutorWorkspace PDF. Install dependencies, then run: pnpm exec playwright install chromium");
  throw error;
} finally {
  await browser?.close();
}
