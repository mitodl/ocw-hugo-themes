import { test as base, expect } from "@playwright/test"
import { TestSiteAlias } from "./test_sites"

type SiteAliasOptions = {
  siteAlias: TestSiteAlias
}

/**
 * Extended `test` with a `siteAlias` option fixture.
 *
 * The active value is set via the project-level `use.siteAlias` in
 * `playwright.config.ts`. Each project pairs a test directory with the
 * site alias it should run against (online vs. offline variant).
 *
 * Import this `test` instead of `@playwright/test` in any test file that
 * lives under `ocw-ci-test-course/` or `ocw-ci-test-course-v3/` so that
 * the same spec can be exercised against both the online and offline builds.
 */
const test = base.extend<SiteAliasOptions>({
  siteAlias: ["course", { option: true }]
})

export { test, expect }
export type { SiteAliasOptions }
