import { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"
import * as path from "path"

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir:    "./tests-e2e",
  testIgnore: ["**/jest/**"],
  /* Maximum time one test can run for. */
  timeout:    60 * 1000,
  expect:     {
    timeout: 10000
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
      name: "firefox",
      use:  {
        ...devices["Desktop Firefox"]
      }
    },
    {
      name: "Google Chrome",
      use:  { ...devices["Desktop Chrome"], channel: "chrome" }
    }
  ]
}

config.globalSetup = path.resolve(__dirname, "./tests-e2e/global-setup.ts")

export default config
