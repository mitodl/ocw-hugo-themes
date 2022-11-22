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
 * Return the path to an e2e test site path.
 */
const siteUrl = (siteAlias: TestSiteAlias, ...paths: string[]) => {
  const site = TEST_SITES[siteAlias]

  const relDest = siteAlias === "www" ? "" : `courses/${site.name}`
  const pathname = [relDest, ...paths].join("/")
  return `http://localhost:${LOCAL_OCW_PORT}/${pathname}`
}

export { TEST_SITES, LOCAL_OCW_PORT, siteUrl, TestSiteAlias }
