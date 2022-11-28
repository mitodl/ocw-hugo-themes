import * as path from "node:path"
import execShCb from "exec-sh"
import handler from "serve-handler"
import Table from "cli-table3"
import * as color from "ansi-colors"

import { TEST_SITES, LOCAL_OCW_PORT, siteUrl, TestSiteAlias } from "./util"
import SimpleServer, { RedirectionRule } from "./util/SimpleServer"
import { env, cleanEnv, stringifyEnv } from "../env"
import { hugo } from "../package_scripts/util"

const execSh = execShCb.promise

const STATIC_API_PORT = 4321

const testEnv = cleanEnv({
  ...process.env,
  OCW_STUDIO_BASE_URL: "http://ocw-studio-rc.odl.mit.edu",
  SEARCH_API_URL:      "https://open.mit.edu/api/v0/search/",
  RESOURCE_BASE_URL:   "https://live-qa.ocw.mit.edu/",
  /**
   * When building test sites, use local server at STATIC_API_PORT for static
   * API requests. See test-sites/__fixtures__/README.md for more.
   */
  STATIC_API_BASE_URL: `http://localhost:${STATIC_API_PORT}`
})

/**
 * Resolve a path relative to package root.
 */
const fromRoot = (...pathFromRoot: string[]) => {
  return path.join(__dirname, "../", ...pathFromRoot)
}
const fromTmp = (...pathFromTmp: string[]) => {
  return path.join(fromRoot("./test-sites/tmp"), ...pathFromTmp)
}

const buildSite = (name: string, destInTmp: string, configPath: string) => {
  return hugo(
    {
      themesDir:   fromRoot("./"),
      destination: fromTmp("dist", destInTmp),
      cacheDir:    fromTmp("hugo_cache"),
      config:      configPath,
      baseURL:     destInTmp,
      verbose:     true
    },
    {
      cwd: fromRoot(`./test-sites/${name}`),
      env: {
        ...process.env,
        ...stringifyEnv(testEnv),
      }
    }
  )
}

/**
 * Redirect all requests /path/to/thing to /ocw-ci-test-www/path/to/thing,
 * except requests to /courses/.
 */
const OCW_WWW_REDIRECT: RedirectionRule = {
  type:      "rewrite",
  match:     /^\/(?!(courses\/))/,
  transform: url => `/ocw-ci-test-www${url}`
}

const steps = {
  /**
   * Set up a sserver that:
   *  - serves the contents of `test-sites/__fixtures__`
   *  - redirects requests like /not/a/course/page to /ocw-ci-test-www/not/a/course/page
   */
  setupStaticApiFixtures: (): void => {
    const server = new SimpleServer(
      (request, response) => {
        return handler(request, response, {
          public: fromRoot(`./test-sites/__fixtures__`)
        })
      },
      {
        rules: [OCW_WWW_REDIRECT]
      }
    )
    server.listen(STATIC_API_PORT)
  },
  /**
   * Build all sites with Hugo.
   *
   * The output will go in `test-sites/tmp/dist`.
   */
  buildAllSites: async (): Promise<void> => {
    await Promise.all(
      Object.entries(TEST_SITES).map(([alias, site]) => {
        const destInTmp =
          alias === "www" ? `/${site.name}` : `/courses/${site.name}`
        return buildSite(site.name, destInTmp, site.configPath)
      })
    )
  },
  /**
   * Set up a server that:
   *  - serves the contents of `test-sites/tmp/dist`
   *  - redirects requests like /not/a/course/page to /ocw-ci-test-www/not/a/course/page
   */
  serveSites: (): void => {
    const server = new SimpleServer(
      (request, response) => {
        return handler(request, response, {
          public: fromTmp("dist")
        })
      },
      {
        rules: [
          {
            type:      "redirect",
            match:     /^\/static\//,
            transform: url => `http://localhost:${env.WEBPACK_PORT}${url}`
          },
          OCW_WWW_REDIRECT
        ]
      }
    )
    server.listen(LOCAL_OCW_PORT)
  },
  /**
   * Pretty-print a table to the terminal with the URLs of all the sites.
   */
  announceSites: (): void => {
    const table = new Table({
      head:  ["Site", "URL"],
      style: { head: ["cyan", "bold"] }
    })
    Object.entries(TEST_SITES).forEach(([alias, site]) => {
      table.push([site.name, siteUrl(alias as TestSiteAlias)])
    })
    console.log(
      [
        "\n",
        color.bold("Now serving the following sites:\n"),
        table.toString(),
        "\n"
      ].join("")
    )
  }
}

const setupTests = async () => {
  await execSh("rm -rf test-sites/tmp", { cwd: fromRoot("./") })

  steps.setupStaticApiFixtures()
  await steps.buildAllSites()
  steps.serveSites()
  steps.announceSites()
}

export default setupTests
