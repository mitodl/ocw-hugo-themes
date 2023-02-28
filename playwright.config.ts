import { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"
import * as path from "path"
import { env } from "./env"

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir:    "./tests-e2e",
  testIgnore: ["**/jest/**"],
  /* Maximum time one test can run for. */
  timeout:    30 * 1000,
  expect:     {
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
  // webServer: {
  //   command:             "yarn start:webpack",
  //   // This just needs to be some address that returns 200 when webpack has finished compiling.
  //   // It finishes all the files concurrently, so any file will work fine.
  //   url:                 `http://0.0.0.0:${env.WEBPACK_PORT}/static_shared/js/www.js`,
  //   reuseExistingServer: !process.env.CI
  // },
  globalSetup: path.resolve(__dirname, "./tests-e2e/global-setup.ts")
}

export default config
