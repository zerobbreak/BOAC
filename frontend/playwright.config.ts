import { defineConfig, devices } from "@playwright/test";

// The tests run against the Vite dev server with the API pointed at http://api.test, which the
// tests answer themselves (e2e/mock-api.ts). No backend or database is needed.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5199",
    headless: true,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Its own port, so a dev server already running against the real API is never reused.
    command: "npx vite --port 5199 --strictPort",
    url: "http://localhost:5199",
    reuseExistingServer: false,
    timeout: 120000,
    env: { VITE_API_URL: "http://api.test" },
  },
});
