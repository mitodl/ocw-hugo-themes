import type { ExecOptions } from "node:child_process"

import dotenv from "dotenv"
import execShCb from "exec-sh"
import * as envalid from "envalid"
import { fromRoot } from "./util"

dotenv.config()
const env = envalid.cleanEnv(process.env, {
  WEBPACK_PORT:            envalid.port(),
  COURSE_HUGO_CONFIG_PATH: envalid.str(),
  WWW_HUGO_CONFIG_PATH:    envalid.str()
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
  await Promise.all([
    buildSite("omnibus-course", env.COURSE_HUGO_CONFIG_PATH),
    buildSite("ocw-www-ci", env.WWW_HUGO_CONFIG_PATH)
  ])
}

export default setupTests
