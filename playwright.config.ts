import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node node_modules/tsx/dist/cli.mjs apps/server/src/dev-memory.ts",
      url: "http://127.0.0.1:3001/healthz",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "node node_modules/next/dist/bin/next dev apps/web --hostname 127.0.0.1",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
