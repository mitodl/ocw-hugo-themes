import { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"
import * as path from "path"
import { env } from "./env"

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: "./tests-e2e",
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect:  {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly:    !!process.env.CI,
  retries:       process.env.CI ? 2 : 0,
  workers:       process.env.CI ? 1 : undefined,
  reporter:      "html",
  use:           {
    actionTimeout: 0,
    trace:         "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use:  {
        ...devices["Desktop Chrome"]
      }
    }
  ],
  webServer: {
    command:             "yarn start:webpack",
    url:                 `http://0.0.0.0:${env.WEBPACK_PORT}/static/css/main.css`,
    reuseExistingServer: !process.env.CI
  },
  globalSetup: path.resolve(__dirname, "./tests-e2e/global-setup.ts")
}

export default config
