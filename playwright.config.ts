import { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"
import * as path from "path"

let testsIgnore: string[] = ["**/jest/**"]
if (process.env.TESTS_IGNORE) {
  testsIgnore = testsIgnore.concat(
    process.env.TESTS_IGNORE.split(",").map(s => s.trim())
  )
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir:    "./tests-e2e",
  testIgnore: testsIgnore,
  /* Maximum time one test can run for. */
  timeout:    60 * 1000,
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
    // ── v2 course tests (ocw-ci-test-course/) ──────────────────────────────
    // Online variant
    {
      name:      "course-v2-online-firefox",
      testMatch: ["**/ocw-ci-test-course/*.spec.ts"],
      use:       { ...devices["Desktop Firefox"], siteAlias: "course" }
    },
    {
      name:      "course-v2-online-chrome",
      testMatch: ["**/ocw-ci-test-course/*.spec.ts"],
      use:       { ...devices["Desktop Chrome"], channel: "chrome", siteAlias: "course" }
    },
    // Offline variant
    {
      name:      "course-v2-offline-firefox",
      testMatch: ["**/ocw-ci-test-course/*.spec.ts"],
      use:       { ...devices["Desktop Firefox"], siteAlias: "course-offline" }
    },
    {
      name:      "course-v2-offline-chrome",
      testMatch: ["**/ocw-ci-test-course/*.spec.ts"],
      use:       { ...devices["Desktop Chrome"], channel: "chrome", siteAlias: "course-offline" }
    },

    // ── v3 course tests (ocw-ci-test-course-v3/) ───────────────────────────
    // Online variant
    {
      name:      "course-v3-online-firefox",
      testMatch: ["**/ocw-ci-test-course-v3/*.spec.ts"],
      use:       { ...devices["Desktop Firefox"], siteAlias: "course-v3" }
    },
    {
      name:      "course-v3-online-chrome",
      testMatch: ["**/ocw-ci-test-course-v3/*.spec.ts"],
      use:       { ...devices["Desktop Chrome"], channel: "chrome", siteAlias: "course-v3" }
    },
    // Offline variant
    {
      name:      "course-v3-offline-firefox",
      testMatch: ["**/ocw-ci-test-course-v3/*.spec.ts"],
      use:       { ...devices["Desktop Firefox"], siteAlias: "course-v3-offline" }
    },
    {
      name:      "course-v3-offline-chrome",
      testMatch: ["**/ocw-ci-test-course-v3/*.spec.ts"],
      use:       { ...devices["Desktop Chrome"], channel: "chrome", siteAlias: "course-v3-offline" }
    },

    // ── All other tests (www, fixtures, dedicated offline spec dirs) ────────
    // These are run by the general projects which exclude the directories
    // handled by the course-specific projects above.
    {
      name:       "firefox",
      testIgnore: [
        "**/ocw-ci-test-course/*.spec.ts",
        "**/ocw-ci-test-course-v3/*.spec.ts"
      ],
      use: {
        ...devices["Desktop Firefox"]
      }
    },
    {
      name:       "Google Chrome",
      testIgnore: [
        "**/ocw-ci-test-course/*.spec.ts",
        "**/ocw-ci-test-course-v3/*.spec.ts"
      ],
      use: { ...devices["Desktop Chrome"], channel: "chrome" }
    }
  ]
}

config.globalSetup = path.resolve(__dirname, "./tests-e2e/global-setup.ts")

export default config
