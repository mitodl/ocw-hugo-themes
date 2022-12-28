/**
 * See {@link env}.
 */
import * as path from "node:path"
import * as envalid from "envalid"
import { ReporterOptions } from "envalid"
import * as dotenv from "dotenv"

import * as color from "ansi-colors"

const envSchema = {
  /**
   * Defaults!
   */
  WEBPACK_ANALYZE: envalid.bool({
    desc:    "Used in webpack build. If `true`, a dependency analysis of the bundle will be included in the build output.",
    default: false
  }),
  WEBPACK_HOST: envalid.str({
    default: "localhost",
    desc:    "Host used by Hugo when querying the Webpack Dev Server. Can be set to your local IP to enable testing OCW on other devices (e.g., phones) within your network."
  }),
  WEBPACK_PORT: envalid.port({
    default: 3001,
    desc:    "The port used by webpack dev server."
  }),
  /**
   * Dev-only defaults
   */
  API_BEARER_TOKEN: envalid.str({
    desc:       "The bearer token to use when making requests to the OCW Studio API.",
    devDefault: ""
  }),
  GIT_CONTENT_SOURCE: envalid.str({
    desc:       "Git organization/user URL from which to pull Hugo site content repositories.",
    devDefault: "git@github.mit.edu:ocw-content-rc"
  }),
  GTM_ACCOUNT_ID: envalid.str({
    desc:       "A string representing a Google account ID to initialize Google Tag Manager with",
    devDefault: ""
  }),
  OCW_COURSE_STARTER_SLUG: envalid.str({
    desc:       "Used when querying the OCW Studio API for course information",
    devDefault: "ocw-course-v2"
  }),
  OCW_STUDIO_BASE_URL: envalid.url({
    desc:       "The base URL of the OCW Studio instance to use for API requests.",
    devDefault: "http://ocw-studio-rc.odl.mit.edu"
  }),
  OCW_TEST_COURSE: envalid.str({
    devDefault: "9.40-spring-2018"
  }),
  RESOURCE_BASE_URL: envalid.url({
    desc:       "Base URL with which to prefix resource paths in hugo's output.",
    devDefault: "https://live-qa.ocw.mit.edu/"
  }),
  SEARCH_API_URL: envalid.url({
    desc:       "The URL of the search API.",
    devDefault: "https://discussions-rc.odl.mit.edu/api/v0/search/"
  }),
  SENTRY_ENV: envalid.url({
    desc:       "The enviroment for Sentry",
    devDefault:  "dev",
  }),
  SITEMAP_DOMAIN: envalid.str({
    desc:       "The domain used when writing fully qualified URLs into the sitemap",
    devDefault: "live-qa.ocw.mit.edu"
  }),
  STATIC_API_BASE_URL: envalid.url({
    desc:       "URL of a deployed Hugo site with a static JSON API to query against",
    devDefault: "https://live-qa.ocw.mit.edu/"
  }),

  /**
   * The default values assume `ocw-content-rc` is a sibling directory of
   * `ocw-hugo-themes`.
   */
  COURSE_CONTENT_PATH: envalid.str({
    desc:       "A path to a base folder containing ocw-course type Hugo sites",
    devDefault: path.resolve(__dirname, "../ocw-content-rc/")
  }),
  FIELDS_CONTENT_PATH: envalid.str({
    desc:       "Path to site content for mit-fields.",
    devDefault: path.resolve(__dirname, "../ocw-content-rc/cpg-fields-test")
  }),
  WWW_CONTENT_PATH: envalid.str({
    desc:       "Path to the ocw-www Hugo content directory.",
    devDefault: path.resolve(__dirname, "../ocw-content-rc/ocw-www")
  }),
  /**
   * The default values for the following path variables all assume that
   * `ocw-hugo-projects` and `ocw-hugo-themes` are sibling directories.
   */
  COURSE_HUGO_CONFIG_PATH: envalid.str({
    desc:       "Path to the ocw-course Hugo configuration file",
    devDefault: path.resolve(
      __dirname,
      "../ocw-hugo-projects/ocw-course-v2/config.yaml"
    )
  }),
  FIELDS_HUGO_CONFIG_PATH: envalid.str({
    desc:       "A path to the mit-fields Hugo configuration file",
    devDefault: path.resolve(
      __dirname,
      "../ocw-hugo-projects/mit-fields/config.yaml"
    )
  }),
  WWW_HUGO_CONFIG_PATH: envalid.str({
    desc:       "Path to the ocw-www Hugo configuration file",
    devDefault: path.resolve(
      __dirname,
      "../ocw-hugo-projects/ocw-www/config.yaml"
    )
  })
}

/**
 * The point of this error is to prevent accidental inclusion of this file in
 * production bundles. We don't want to load the extra dependencies, and in
 * theory it could be a security issue (if our env vars had any secrets).
 *
 * If an env variable is needed in the bundle, it should be inserted via
 * webpack's [DefinePlugin](https://webpack.js.org/plugins/define-plugin/).
 */
const assertIsRunningInNode = () => {
  if (process.release.name !== "node") {
    throw new Error(
      [
        "This module should only be imported into a node process, not a browser environment.",
        "To access environment variables in the browser, use process.env directly."
      ].join("")
    )
  }
}
assertIsRunningInNode()

/**
 * A custom reporter for envalid that alerts user to the fact that in production,
 * fewer environment variables will be set.
 */
const reporter = <T>(opts: ReporterOptions<T>) => {
  if (Object.keys(opts.errors).length > 0) {
    console.log(color.yellow("Environment variable validation error."))

    console.group()
    console.log(`NODE_ENV is: ${process.env.NODE_ENV}`)
    console.log(
      "If NODE_ENV is undefined or 'production', fewer default environment values are used."
    )
    console.groupEnd()
  }

  envalid.defaultReporter(opts)
}

/**
 * Returns an env object with values stringified.
 */
const stringifyEnv = (
  env: Readonly<Record<string, string | number | boolean>>
): Record<string, string> => {
  const stringifiedEnv = Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, value.toString()])
  )
  return stringifiedEnv
}

dotenv.config()

/**
 * Validate `envObj` against expected environment variable schema.
 */
const cleanEnv = (envObj: Record<string, string | undefined>) =>
  envalid.cleanEnv(envObj, envSchema, { reporter })

/**
 * Validated environment variables, read from:
 *  1. `process.env`,
 *  2. falling back to `.env` if it exists,
 *  3. falling back to defaults defined in `envSchema`. The schema specifies
 *    defaults and development-only defaults. I.e., if `NODE_ENV` is set to
 *    'production' or undefined (assumpted to be production), fewer defaults
 *    are be used.
 *
 * This should only be used in NodeJS processes, not in the browser. See
 * {@link assertIsRunningInNode | more}.
 */
const env = cleanEnv(process.env)

export { env, cleanEnv, envSchema, stringifyEnv }
