import { defineConfig, devices } from "@playwright/test";

const productionUrl = process.env.PRODUCTION_URL;

if (!productionUrl) {
  throw new Error("PRODUCTION_URL is required for production browser checks.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/production" }]],
  use: {
    baseURL: productionUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "production-chromium", use: { ...devices["Desktop Chrome"] } }],
});
