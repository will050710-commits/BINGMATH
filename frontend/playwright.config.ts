import { defineConfig, devices } from "@playwright/test";

/** Browser checks exercise the actual chat route with a deterministic API fixture. */
export default defineConfig({
  testDir: "./tests",
  testMatch: "tutor-workspace.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  outputDir: "../work/playwright-results",
  reporter: [
    ["list"],
    ["json", { outputFile: "../work/playwright-results/report.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 1600, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1600, height: 1000 } } },
  ],
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000/DuoMCB",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
