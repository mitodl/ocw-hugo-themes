import { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"
import * as path from "path"

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir:    "./tests-e2e",
  testIgnore: ["**/jest/**"],
  timeout:    60 * 1000,
  expect:     {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly:    !!process.env.CI,
  retries:       process.env.CI ? 2 : 0,
  workers:       process.env.CI ? 1 : undefined,
  reporter:      "html",
  use:           {
    actionTimeout: 0,
    trace:         "on-first-retry",
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
      use:  {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        launchOptions: {
          args: [
            '--autoplay-policy=no-user-gesture-required',
            '--start-maximized',
            '--incognito',
          ],
        },
      },
    },
  ],
}

config.globalSetup = path.resolve(__dirname, "./tests-e2e/global-setup.ts")

export default config
