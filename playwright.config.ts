import { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'
import dotenv from 'dotenv'
import * as path from "path"
import * as envalid from "envalid"

dotenv.config()
const env = envalid.cleanEnv(process.env, {
  WEBPACK_PORT: envalid.port({ default: 3001 })
})

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests-e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect:  {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly:    !!process.env.CI,
  retries:       process.env.CI ? 2 : 0,
  workers:       process.env.CI ? 1 : undefined,
  reporter:      'html',
  use:           {
    actionTimeout: 0,
    trace:         'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use:  {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command:             "yarn start:webpack",
    url:                 `http://localhost:${env.WEBPACK_PORT}/static/css/main.css`,
    reuseExistingServer: !process.env.CI,
  },
  globalSetup: path.resolve(__dirname, './tests-e2e/global-setup.ts'),
}

export default config
