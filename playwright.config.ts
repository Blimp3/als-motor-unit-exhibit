import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "browser.spec.ts",
  fullyParallel: false,
  retries: 1,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3011",
    locale: "en-US",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- -H 127.0.0.1 -p 3011",
    url: "http://127.0.0.1:3011",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
