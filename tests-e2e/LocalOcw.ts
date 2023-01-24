import * as path from "node:path"
import * as http from "node:http"
import { SpawnOptions } from "node:child_process"
import execShCb from "exec-sh"
import handler from "serve-handler"
import Table from "cli-table3"
import * as color from "ansi-colors"

import {
  TEST_SITES,
  LOCAL_OCW_PORT,
  siteUrl,
  TestSiteAlias
} from "./util/test_sites"
import SimpleServer, { RedirectionRule } from "./util/SimpleServer"
import { env, cleanEnv, stringifyEnv } from "../env"
import { hugo } from "../package_scripts/util"

const execSh = execShCb.promise

const fromRoot = (...pathFromRoot: string[]) => {
  return path.join(__dirname, "../", ...pathFromRoot)
}

/**
 * Redirect all requests /path/to/thing to /ocw-ci-test-www/path/to/thing,
 * except requests to /courses/.
 */
const OCW_WWW_REWRITE: RedirectionRule = {
  type:      "rewrite",
  match:     /^\/(?!(courses\/|api\/))/,
  transform: url => `/ocw-ci-test-www${url}`
}

/**
 * Redirects requests to
 *  original: /api/websites?type=course-v2
 *  rewritten: /api/websites.json?type=course-v2
 * so our static file server can serve the JSON.
 */
const API_JSON_REWRITE: RedirectionRule = {
  type:      "rewrite",
  match:     /^\/api\//,
  transform: urlText => {
    // We need to provide some baseurl, but we will not use it.
    const url = new URL(urlText, "http://fakesite.mit.edu")
    url.pathname = `${url.pathname.replace(/\/$/, "")}.json`
    return [url.pathname, url.search, url.hash].join("")
  }
}

interface LocalOCWOptions {
  /**
   * All sites will be built to subdirectories of this directory.
   */
  rootDestinationDir: string
  fixturesPort: number
}

/**
 * Helps build and serve OCW sites locally.
 */
class LocalOCW {
  private rootDestinationDir: string

  private fixturesPort: number

  /**
   * A server that responds to STATIC_API_BASE_URL requests with JSON from
   * test-sites/__fixtures__.
   */
  fixturesServer: {
    /**
     * Set a handler to be called before the static fixtures handler.
     */
    patchHandler: (handler: http.RequestListener) => void
    /**
     * Reset the handler; i.e., clears `patchHandler`
     */
    resetHandler: () => void
    /**
     * Close the server
     */
    close: () => void
    /**
     * Listen to requests
     */
    listen: () => void
  }

  constructor({ rootDestinationDir, fixturesPort }: LocalOCWOptions) {
    this.rootDestinationDir = rootDestinationDir
    this.fixturesPort = fixturesPort
    this.fixturesServer = this.makeFixturesServer()
  }

  private makeFixturesServer = () => {
    let patchedHandler: http.RequestListener | undefined
    const server = new SimpleServer(
      (request, response) => {
        if (patchedHandler) {
          patchedHandler(request, response)
          if (response.headersSent) return
        }

        return handler(request, response, {
          public: fromRoot(`./test-sites/__fixtures__`)
        })
      },
      {
        rules: [OCW_WWW_REWRITE, API_JSON_REWRITE]
      }
    )
    return {
      patchHandler: (newHandler: http.RequestListener): void => {
        patchedHandler = newHandler
      },
      resetHandler: (): void => {
        patchedHandler = undefined
      },
      close:  () => server.close(),
      listen: () => server.listen(this.fixturesPort)
    }
  }

  /**
   * Build a test site to specified destination within rootDestinationDir.
   */
  buildSite = (
    alias: TestSiteAlias,
    { execOptions }: { execOptions?: SpawnOptions } = {}
  ) => {
    const site = TEST_SITES[alias]
    const destInTmp =
      alias === "www" ? `/${site.name}` : `/courses/${site.name}`
    return hugo(
      {
        themesDir:   fromRoot("./"),
        destination: path.join(this.rootDestinationDir, destInTmp),
        ignoreCache: true,
        config:      site.configPath,
        baseURL:     destInTmp,
        verbose:     true
      },
      {
        cwd: fromRoot(`./test-sites/${site.name}`),
        ...execOptions,
        env: {
          ...process.env,
          ...stringifyEnv(
            cleanEnv({
              ...process.env,
              OCW_STUDIO_BASE_URL: `http://localhost:${this.fixturesPort}`,
              SEARCH_API_URL:      "https://open.mit.edu/api/v0/search/",
              RESOURCE_BASE_URL:   "https://live-qa.ocw.mit.edu/",
              /**
               * When building test sites, use local server at fixturesPort for static
               * API requests. See test-sites/__fixtures__/README.md for more.
               */
              STATIC_API_BASE_URL: `http://localhost:${this.fixturesPort}`,
              API_BEARER_TOKEN:    ""
            })
          )
        }
      }
    )
  }

  /**
   * Set up a server that:
   *  - serves the contents of `test-sites/tmp/dist`
   *  - redirects requests like /not/a/course/page to /ocw-ci-test-www/not/a/course/page
   */
  serveSites = (): void => {
    const server = new SimpleServer(
      (request, response) => {
        return handler(request, response, {
          public: this.rootDestinationDir
        })
      },
      {
        rules: [
          {
            type:      "redirect",
            match:     /^\/static_shared\//,
            transform: url => `http://localhost:${env.WEBPACK_PORT}${url}`
          },
          OCW_WWW_REWRITE
        ]
      }
    )
    server.listen(LOCAL_OCW_PORT)
  }

  buildAllSites = async (): Promise<void> => {
    await Promise.all(
      Object.keys(TEST_SITES).map(alias => {
        return this.buildSite(alias as TestSiteAlias)
      })
    )
  }

  /**
   * Pretty-print a table to the terminal with the URLs of all the sites.
   */
  announceSites = (): void => {
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

  rmrfTmp = async (): Promise<void> => {
    await execSh(`rm -rf ${this.rootDestinationDir}`)
  }
}

export default LocalOCW
export { fromRoot }
