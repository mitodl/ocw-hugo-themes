import { env } from "../../env"

const LOCAL_OCW_PORT = 3010

/**
 * COURSE_V3_CANONICAL_DOMAIN used when building test sites.
 *
 */
const V3_CANONICAL_DOMAIN = "learn-test.mit.edu"

type TestSiteAlias = "course" | "course-v3" | "course-v3-offline" | "www"
type TestSite = {
  name: string
  contentDir: string
  configPath: string
  /**
   * Site-relative base path, without leading or trailing slashes.
   *
   * `LocalOcw.buildSite` prefixes this with "/" and passes the result as both
   * Hugo's `--baseURL` and its output directory, and `siteUrl` builds spec URLs
   * from it, so the built site and the URLs specs request cannot drift apart.
   * The `--baseURL` flag overrides the `baseUrl: "/"` set in the Hugo configs.
   *
   * course-v3 sites use the `/courses/o/` prefix they are served under in
   * production (see COURSE_V3_BASE_URL_PREFIX) rather than the bare `/courses/`
   * that v2 uses, so path-prefix handling is exercised the way it ships.
   */
  basePath: string
}
const TEST_SITES: Record<TestSiteAlias, TestSite> = {
  course: {
    name:       "ocw-ci-test-course",
    contentDir: "ocw-ci-test-course",
    configPath: env.COURSE_HUGO_CONFIG_PATH,
    basePath:   "courses/ocw-ci-test-course"
  },
  "course-v3": {
    name:       "ocw-ci-test-course-v3",
    contentDir: "ocw-ci-test-course", // Reuses v2 content
    configPath: env.COURSE_V3_HUGO_CONFIG_PATH,
    /**
     * Same trailing slug as the v2 site, matching production: ocw-studio derives
     * the v3 baseURL from the same `url_path` that populates `site_url_path` in
     * data/course.json, so the served slug always equals the authored one. The
     * `o/` segment keeps this from colliding with the v2 output directory.
     */
    basePath:   "courses/o/ocw-ci-test-course"
  },
  "course-v3-offline": {
    name:       "ocw-ci-test-course-v3-offline",
    contentDir: "ocw-ci-test-course",
    configPath: env.COURSE_V3_OFFLINE_HUGO_CONFIG_PATH,
    basePath:   "courses/o/ocw-ci-test-course-v3-offline"
  },
  www: {
    name:       "ocw-ci-test-www",
    contentDir: "ocw-ci-test-www",
    configPath: env.WWW_HUGO_CONFIG_PATH,
    basePath:   "ocw-ci-test-www"
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
 * siteUrl("course-v3", "pages/some/page") // "http://localhost:3010/courses/o/ocw-ci-test-course-v3/pages/some/page"
 * ```
 */
const siteUrl = (siteAlias: TestSiteAlias, ...relPath: string[]) => {
  const playwrightBaseUrl = env.PLAYWRIGHT_BASE_URL
  const site = TEST_SITES[siteAlias]

  // www is rewritten to the server root; see OCW_WWW_REWRITE in LocalOcw.
  const relDest = siteAlias === "www" ? "" : site.basePath
  const pathName = [relDest, ...relPath]
    .join("/")
    .replace(/([^:])(\/\/+)/g, "$1/")
  return new URL(pathName, playwrightBaseUrl).href
}

export {
  TEST_SITES,
  LOCAL_OCW_PORT,
  V3_CANONICAL_DOMAIN,
  siteUrl,
  TestSiteAlias
}
