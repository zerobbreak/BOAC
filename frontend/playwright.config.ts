import { defineConfig } from "@playwright/test";

// E2E_BASE_URL points the suite at any running site (local Vite by default, or the Railway web service).
export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    headless: true,
    // Traces and reports would record the real account passwords typed at sign-in, so none are kept.
    trace: "off"
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    { name: "chromium", dependencies: ["setup"] }
  ]
});
