import { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"
import * as path from "path"
import { SiteAliasOptions } from "./tests-e2e/util/fixtures"

let testsIgnore: string[] = ["**/jest/**"]
if (process.env.TESTS_IGNORE) {
  testsIgnore = testsIgnore.concat(
    process.env.TESTS_IGNORE.split(",").map(s => s.trim())
  )
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig<SiteAliasOptions> = {
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
      use:       {
        ...devices["Desktop Chrome"],
        channel:   "chrome",
        siteAlias: "course"
      }
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
      use:       {
        ...devices["Desktop Chrome"],
        channel:   "chrome",
        siteAlias: "course-offline"
      }
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
      use:       {
        ...devices["Desktop Chrome"],
        channel:   "chrome",
        siteAlias: "course-v3"
      }
    },
    // Offline variant
    // ask-tim-v3.spec.ts is excluded here: it hardcodes CoursePage(page,
    // "course-v3") throughout and doesn't use the siteAlias fixture at all,
    // since AskTIM isn't in the offline bundle yet (see that file's own
    // header comment). Its one offline-relevant test asserts absence via
    // offlineV3FileUrl() directly, independent of project, so it still runs
    // under the online projects below without needing this file at all.
    {
      name:       "course-v3-offline-firefox",
      testMatch:  ["**/ocw-ci-test-course-v3/*.spec.ts"],
      testIgnore: ["**/ask-tim-v3.spec.ts"],
      use:        { ...devices["Desktop Firefox"], siteAlias: "course-v3-offline" }
    },
    {
      name:       "course-v3-offline-chrome",
      testMatch:  ["**/ocw-ci-test-course-v3/*.spec.ts"],
      testIgnore: ["**/ask-tim-v3.spec.ts"],
      use:        {
        ...devices["Desktop Chrome"],
        channel:   "chrome",
        siteAlias: "course-v3-offline"
      }
    },

    // ── All other tests (www, fixtures, dedicated offline spec dirs) ────────
    // These are run by the general projects which exclude the directories
    // handled by the course-specific projects above.
    {
      name:       "firefox",
      testIgnore: [
        ...testsIgnore,
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
        ...testsIgnore,
        "**/ocw-ci-test-course/*.spec.ts",
        "**/ocw-ci-test-course-v3/*.spec.ts"
      ],
      use: { ...devices["Desktop Chrome"], channel: "chrome" }
    }
  ]
}

config.globalSetup = path.resolve(__dirname, "./tests-e2e/global-setup.ts")

export default config
