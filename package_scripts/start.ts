import * as path from "node:path"

import { program } from "commander"
import concurrently from "concurrently"
import inquirer from "inquirer"
import * as color from "ansi-colors"
import execSh from "exec-sh"

import { env, envSchema } from "../env"
import * as u from "./util"

type HugoServerOptions = {
  port: number
  bind: string
  config: string
  themesDir: string
  renderToDisk: boolean
}

const hugoServer = (
  opts: Partial<HugoServerOptions> & Pick<HugoServerOptions, "config">
) => {
  const allOpts: HugoServerOptions = {
    port:         3000,
    bind:         "0.0.0.0",
    themesDir:    process.cwd(),
    renderToDisk: true,
    ...opts
  }
  return `hugo server ${u.getOptions(
    allOpts
  )}`
}

/**
 * Start webpack dev server and another script, specified by `other`.
 */
const startWebpackAnd = ({
  command,
  name,
  cwd
}: {
  command: string
  name: string
  cwd?: string
}): void =>
  concurrently(
    [
      {
        command:     "yarn start:webpack",
        name:        "webpack",
        prefixColor: "blue"
      },
      {
        command,
        name,
        cwd,
        env:         { ...process.env, ...env },
        prefixColor: "red"
      }
    ],
    {
      killOthers: ["failure", "success"]
    }
  )

/**
 * Check whether `dirpath` is a non-empty directory. If so, return. If not,
 * clone `repoUrl` into `dirpath` after prompting user for confirmation.
 */
const ensureGitContent = async ({
  dirpath,
  repoUrl,
  explainMissingContent
}: {
  dirpath: string
  repoUrl: string
  explainMissingContent: string
}) => {
  if (!(await u.dirHasContent(dirpath))) {
    const message = [
      explainMissingContent,
      `    ${color.cyan(dirpath)}`,
      "but no content was found.\n",
      "Would you like to clone the content from:",
      `    ${color.cyan(repoUrl)}?`
    ].join("\n")

    const { clone } = await inquirer.prompt([
      {
        type:   "confirm",
        name:   "clone",
        header: "Clone course content?",
        message
      }
    ])
    if (!clone) {
      console.log("Exiting.")
      process.exit(1)
    }
    await execSh.promise(`git clone ${repoUrl} ${dirpath}`)
    return
  }
  return
}

const ensureHugoConfig = async (envVarName: string) => {
  const filepath = env[envVarName]
  if (await u.exists(filepath)) return
  const segments = filepath.split(path.sep)
  const projectsIndex = segments.findIndex(s => s === "ocw-hugo-projects")

  if (projectsIndex < 0) {
    throw new Error(`Configuration file at ${path} does not exist.`)
  }

  const projectsPath = path.join(
    path.sep,
    ...segments.slice(0, projectsIndex + 1)
  )

  const explainMissingContent = [
    `CLI option ${color.yellow("--config")}`,
    "(possibly defaulting to environment variable(s); use --help for details)",
    "indicates that ocw-hugo-projects should exist at"
  ].join(" ")

  await ensureGitContent({
    dirpath: projectsPath,
    repoUrl: "git@github.com:mitodl/ocw-hugo-projects.git",
    explainMissingContent
  })
}

const gitRepoUrl = (userLike: string, repoName: string) =>
  `${userLike}/${repoName}.git`

/**
 * A shortcut for constructing commander options that construct their descriptions
 * from envSchema and have default values from env.
 *
 * The value for `optName` should follow [Commander's format](https://github.com/tj/commander.js#common-option-types-boolean-and-value)
 *
 * @example
 * ```ts
 * program
 *  .requiredOption(...makeEnvOpt("--opt-name", "ENV_VARIABLE_NAME"))
 * ```
 */
const makeEnvOpt = (
  optName: string,
  envVarName: keyof typeof env
): [string, string, string | boolean] => {
  return [
    optName,
    `${envSchema[envVarName].desc}\nDefaults to value of ${envVarName} environment variable.`,
    /**
     * Commander doesn't want the default argument values to be numbers.
     * But they'll be coerced anyway, and specifying envVarName as `keyof typeof env`
     * is nice for auto-complete.
     */
    // @ts-expect-error See above note.
    env[envVarName]
  ]
}

const start = program.description("Start ocw-hugo-themes development servers.")

type StartOptions = {
  gitContentSource: string
  contentDir: string
  config: string
}

/**
 * This program has three subcommands: `start course`, `start www`, and
 * `start fields`. They all do basically the same thing: start webpack + hugo
 * dev servers.
 *
 * That logic is shared here.
 */
const startSiteAction = async (opts: StartOptions, cliOptNames: string[]) => {
  const name = path.basename(opts.contentDir)
  const repoUrl = gitRepoUrl(opts.gitContentSource, name)
  const explainMissingContent = [
    `CLI argument(s) ${cliOptNames.map(opt => color.yellow(opt)).join(",")}`,
    "(possibly defaulting to an environment variable value(s); use --help for details)",
    `indicate that site content should exist at:`
  ].join(" ")

  await ensureGitContent({
    dirpath: opts.contentDir,
    repoUrl,
    explainMissingContent
  })

  await ensureHugoConfig("COURSE_HUGO_CONFIG_PATH")

  startWebpackAnd({
    name:    "hugo",
    cwd:     opts.contentDir,
    command: hugoServer({ config: opts.config })
  })
}

start
  .command("course")
  .description("Start webpack + hugo dev servers for an ocw course.")
  .argument(
    "[shortid]",
    "shortid of the course to run. Defaults to value of OCW_TEST_COURSE environment variable.",
    env.OCW_TEST_COURSE
  )
  .requiredOption(...makeEnvOpt("--content-dir <value>", "COURSE_CONTENT_PATH"))
  .requiredOption(...makeEnvOpt("--config <value>", "COURSE_HUGO_CONFIG_PATH"))
  .requiredOption(
    ...makeEnvOpt("--git-content-source <value>", "GIT_CONTENT_SOURCE")
  )
  .action(async (shortId: string, opts: StartOptions) => {
    const contentDir = `${opts.contentDir}/${shortId}`
    /**
     * `start course` is different from the other two in that the contentDir is
     * not actually the site directory. So standardize the options to have the
     * same format as other two subcommands.
     */
    const standardized = { ...opts, contentDir }
    startSiteAction(standardized, ["[shortid]", "--content-dir"])
  })

start
  .command("www")
  .description("Start webpack + hugo dev servers for ocw-www (homepage).")
  .requiredOption(...makeEnvOpt("--content-dir <value>", "WWW_CONTENT_PATH"))
  .requiredOption(...makeEnvOpt("--config <value>", "WWW_HUGO_CONFIG_PATH"))
  .requiredOption(
    ...makeEnvOpt("--git-content-source <value>", "GIT_CONTENT_SOURCE")
  )
  .action(async (opts: StartOptions) => {
    startSiteAction(opts, ["--content-dir"])
  })

start
  .command("fields")
  .description("Start webpack + hugo dev servers for mit-fields.")
  .requiredOption(...makeEnvOpt("--content-dir <value>", "FIELDS_CONTENT_PATH"))
  .requiredOption(...makeEnvOpt("--config <value>", "FIELDS_HUGO_CONFIG_PATH"))
  .requiredOption(
    ...makeEnvOpt("--git-content-source <value>", "GIT_CONTENT_SOURCE")
  )
  .action(async (opts: StartOptions) => {
    startSiteAction(opts, ["--content-dir"])
  })

start.parse()
