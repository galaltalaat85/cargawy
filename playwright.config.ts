import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

/** E2E + API tests run against a production build bound to the dedicated TEST database. */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { baseURL, locale: "ar-EG", trace: "off", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `${baseURL}/api/v1/brands`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL!,
      DISABLE_RATE_LIMIT: "true",
      NEXT_PUBLIC_SITE_URL: baseURL,
      EMAIL_DRIVER: "console",
      STORAGE_DRIVER: "local",
      ALLOW_INDEXING: "false",
    },
  },
});
