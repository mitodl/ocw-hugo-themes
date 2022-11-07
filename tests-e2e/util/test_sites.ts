import * as path from "node:path"
import { env } from "../../env"

type TestSiteAlias = "course" | "www"
type TestSite = {
  name: string
  port: number
  configPath: string
}
const TEST_SITES: Record<TestSiteAlias, TestSite> = {
  course: {
    name:       "ocw-ci-test-course",
    port:       3010,
    configPath: env.COURSE_HUGO_CONFIG_PATH
  },
  www: {
    name:       "ocw-ci-test-www",
    port:       3011,
    configPath: env.WWW_HUGO_CONFIG_PATH
  }
}

/**
 * Return the path to an e2e test site.
 */
const siteUrl = (siteName: TestSiteAlias, ...paths: string[]) => {
  const testSite = TEST_SITES[siteName]
  const baseURL = `http://localhost:${testSite.port}`
  return path.join(baseURL, ...paths)
}

export { TEST_SITES, siteUrl, TestSiteAlias }
