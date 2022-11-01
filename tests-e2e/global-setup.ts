import { ExecOptions } from "node:child_process"
import * as http from "node:http"
import * as path from "node:path"
import dotenv from "dotenv"
import execShCb from "exec-sh"
import * as envalid from "envalid"
import { TEST_SITES } from "./util"
import handler from "serve-handler"
import Table from "cli-table3"
import * as color from "ansi-colors"


dotenv.config()
const env = envalid.cleanEnv(process.env, {
  WEBPACK_PORT: envalid.port()
})

const execSh = execShCb.promise

/**
 * Resolve a path relative to package root.
 */
const fromRoot = (...pathFromRoot: string[]) => {
  return path.join(__dirname, "../", ...pathFromRoot)
}
interface HugoOptions {
  baseURL: string
  themesDir: string
  config: string
  destination: string
}
const hugo = (hugoOptions: HugoOptions, execOptions: ExecOptions) => {
  const flags = Object.entries(hugoOptions)
    .map(([key, value]) => `--${key}=${value}`)
    .join(" ")
  return execSh(`yarn hugo ${flags} --verbose`, execOptions)
}

const buildSite = (name: string, configPath: string) => {
  return hugo(
    {
      themesDir:   fromRoot("./"),
      destination: fromRoot(`./test-sites/${name}/dist`),
      baseURL:     `http://localhost:${env.WEBPACK_PORT}`,
      config:      configPath
    },
    {
      cwd: fromRoot(`./test-sites/${name}`)
    }
  )
}

const setupTests = async () => {
  const table = new Table({
    head:  ["Site", "URL"],
    style: { head: ["cyan", "bold"] }
  })

  const sites = Object.values(TEST_SITES)
  await Promise.all(sites.map(site => buildSite(site.name, site.configPath)))
  sites.forEach(site => {
    http
      .createServer((request, response) => {
        return handler(request, response, {
          public: fromRoot(`./test-sites/${site.name}/dist`)
        })
      })
      .listen(site.port)
    table.push([site.name, `http://localhost:${site.port}`])
  })

  console.log([
    "\n",
    color.bold("Now serving the following sites:\n"),
    table.toString(),
    "\n"
  ].join(""))
}

export default setupTests
