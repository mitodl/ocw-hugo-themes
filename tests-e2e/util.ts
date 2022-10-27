import * as path from "node:path"
import * as dotenv from "dotenv"
import * as envalid from "envalid"

dotenv.config()
const env = envalid.cleanEnv(process.env, {
  PROJECT_CWD:             envalid.str({
    desc: "The path to the root of the project. This should be set automatically by Yarn. See https://yarnpkg.com/advanced/lifecycle-scripts#environment-variables."
  }),
})

/**
 * Resolve a path relative to package root.
 */
const fromRoot = (...pathFromRoot: string[]) => {
  return path.join(env.PROJECT_CWD, ...pathFromRoot)
}

type SiteName = "omnibus-course" | "ocw-www-ci"
/**
 * Return the path to an e2e test site.
 */
const distFile = (siteName: SiteName, relPath: string) => `file://${fromRoot(`./test-sites/${siteName}/dist/${relPath}`)}`

export { fromRoot, distFile }
