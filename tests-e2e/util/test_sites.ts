import path from "path"

import { env } from "../../env"

const LOCAL_OCW_PORT = 3010

type TestSiteAlias = "course" | "www"
type TestSite = {
  name: string
  configPath: string
}
const TEST_SITES: Record<TestSiteAlias, TestSite> = {
  course: {
    name:       "ocw-ci-test-course",
    configPath: env.COURSE_HUGO_CONFIG_PATH
  },
  www: {
    name:       "ocw-ci-test-www",
    configPath: env.WWW_HUGO_CONFIG_PATH
  }
}

/**
 * Returns the URL for a site page.
 * @param siteAlias Alias of the site
 * @param relPath Path to the page relative to site root. Can be given as a string or an array of strings.
 * @returns URL for the page.
 *
 * @example
 * ```ts
 * siteUrl("www", "about") // "http://localhost:3010/about"
 * siteUrl("course", "pages/some/page") // "http://localhost:3010/courses/ocw-ci-test-course/pages/some/page"
 * siteUrl("course", ["pages", "some", "page"]) // "http://localhost:3010/courses/ocw-ci-test-course/pages/some/page"
 * ```
 */
const siteUrl = (siteAlias: TestSiteAlias, ...relPath: string[]) => {
  const playwrightBaseUrl = env.PLAYWRIGHT_BASE_URL
  const site = TEST_SITES[siteAlias]

  const relDest = siteAlias === "www" ? "" : `courses/${site.name}`
  const pathName = [relDest, ...relPath].join("/")
  return path.join(playwrightBaseUrl, pathName)
}

export { TEST_SITES, LOCAL_OCW_PORT, siteUrl, TestSiteAlias }
