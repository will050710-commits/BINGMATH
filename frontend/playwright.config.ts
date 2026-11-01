import { defineConfig, devices } from "@playwright/test";

/** Browser checks exercise the actual chat route and CLIL pilot route. */
export default defineConfig({
  testDir: "./tests",
  testMatch: ["tutor-workspace.spec.ts", "clil-pilot.spec.ts", "mobile-*.spec.ts"],
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
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.CI ? undefined : "chrome",
        viewport: { width: 1600, height: 1000 },
      },
    },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next ${process.env.PLAYWRIGHT_USE_PRODUCTION === "1" ? "start" : "dev"} --hostname 127.0.0.1 --port 3000`,
    url: "http://127.0.0.1:3000/offline",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
