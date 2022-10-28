import * as path from "node:path"
import * as dotenv from "dotenv"
import * as envalid from "envalid"

dotenv.config()
const env = envalid.cleanEnv(process.env, {
  PROJECT_CWD:             envalid.str({
    desc: "The path to the root of the project. This should be set automatically by Yarn. See https://yarnpkg.com/advanced/lifecycle-scripts#environment-variables."
  }),
  COURSE_HUGO_CONFIG_PATH: envalid.str(),
  WWW_HUGO_CONFIG_PATH:    envalid.str()
})

/**
 * Resolve a path relative to package root.
 */
const fromRoot = (...pathFromRoot: string[]) => {
  return path.join(env.PROJECT_CWD, ...pathFromRoot)
}


type TestSiteName = "omnibus-course" | "ocw-www-ci"
type TestSite = {
  name: TestSiteName,
  port: number
  configPath: string
}
const TEST_SITES: Record<TestSiteName, TestSite> = {
  "omnibus-course": {
    name:       "omnibus-course",
    port:       3010,
    configPath: env.COURSE_HUGO_CONFIG_PATH
  },
  "ocw-www-ci": {
    name:       "ocw-www-ci",
    port:       3011,
    configPath: env.WWW_HUGO_CONFIG_PATH
  }
}
/**
 * Return the path to an e2e test site.
 */
const distFile = (siteName: TestSiteName, ...paths: string[]) => {
  const testSite = TEST_SITES[siteName]
  const baseURL = `http://localhost:${testSite.port}`
  return path.join(baseURL, ...paths)
}

export { fromRoot, distFile, TEST_SITES }
