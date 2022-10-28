import type { ExecOptions } from "node:child_process"
import http from "node:http"

import dotenv from "dotenv"
import execShCb from "exec-sh"
import * as envalid from "envalid"
import { fromRoot, TEST_SITES } from "./util"
import handler from "serve-handler"

dotenv.config()
const env = envalid.cleanEnv(process.env, {
  WEBPACK_PORT: envalid.port(),
})

const execSh = execShCb.promise

interface HugoOptions {
  baseURL: string
  themesDir: string
  config: string
  destination: string
}
const hugo = (hugoOptions: HugoOptions, execOptions: ExecOptions) => {
  const flags = Object.entries(hugoOptions).map(([key, value]) => `--${key}=${value}`).join(' ')
  return execSh(`hugo ${flags} --verbose`, execOptions)
}

const buildSite = (name: string, configPath: string) => {
  return hugo({
    themesDir:   fromRoot("./"),
    destination: fromRoot(`./test-sites/${name}/dist`),
    baseURL:     `http://localhost:${env.WEBPACK_PORT}`,
    config:      configPath
  }, {
    cwd: fromRoot(`./test-sites/${name}`)
  })
}

const setupTests = async () => {
  const sites = Object.values(TEST_SITES)
  await Promise.all(sites.map(site => buildSite(site.name, site.configPath)))
  sites.forEach(site => {
    http.createServer((request, response) => {
      return handler(request, response, {
        public: fromRoot(`./test-sites/${site.name}/dist`)
      })
    }).listen(site.port)
  })
}

export default setupTests
