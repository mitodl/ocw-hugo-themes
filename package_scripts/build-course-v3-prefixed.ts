import * as fs from "node:fs"
import * as http from "node:http"
import * as path from "node:path"
import { spawn, SpawnOptions } from "node:child_process"

import color from "ansi-colors"
import { program } from "commander"
import handler from "serve-handler"

import { env, stringifyEnv } from "../env"

type CourseMetadata = Record<string, string | undefined>

type Options = {
  baseUrl?: string
  baseUrlPrefix: string
  clean: boolean
  config: string
  contentDir: string
  logLevel: string
  outDir: string
  port: string
  resourceBaseUrl: string
  serve: boolean
  skipWebpack: boolean
  staticApiBaseUrl: string
}

const yarnCommand = process.platform === "win32" ? "yarn.cmd" : "yarn"
const themesDir = path.resolve(__dirname, "..")

const run = (
  command: string,
  args: string[],
  options: SpawnOptions = {}
): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options })
    child.on("error", reject)
    child.on("close", code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`))
      }
    })
  })

const normalizeBaseUrl = (baseUrl: string): string => {
  if (!baseUrl.startsWith("/")) {
    throw new Error("--base-url must be a site-relative path starting with /")
  }

  const normalized = `/${baseUrl.replace(/^\/+|\/+$/g, "")}`
  if (normalized === "/") {
    throw new Error("--base-url must include a course path, not just /")
  }

  if (normalized.split("/").some(segment => [".", ".."].includes(segment))) {
    throw new Error("--base-url must not include . or .. path segments")
  }

  return normalized
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const courseSlugFromMetadata = (
  metadata: CourseMetadata,
  courseShortId: string
): string => {
  if (metadata["site_url_path"]) {
    const pathParts = metadata["site_url_path"].split("/").filter(Boolean)
    const slug = pathParts[pathParts.length - 1]
    if (slug) return slug
  }

  const slugParts = [
    metadata["primary_course_number"],
    metadata["course_title"],
    metadata["term"],
    metadata["year"]
  ]
    .filter((part): part is string => Boolean(part))
    .map(slugify)

  return slugParts.length > 0 ? slugParts.join("-") : slugify(courseShortId)
}

const readCourseMetadata = async (
  contentDir: string
): Promise<CourseMetadata> => {
  const metadataPath = path.join(contentDir, "data/course.json")
  const metadata = await fs.promises.readFile(metadataPath, "utf-8")
  return JSON.parse(metadata) as CourseMetadata
}

const resolveContentDir = (contentDir: string, courseShortId: string): string => {
  const resolved = path.resolve(contentDir)
  return fs.existsSync(path.join(resolved, "data/course.json")) ?
    resolved :
    path.join(resolved, courseShortId)
}

const ensureContent = async (contentDir: string, courseShortId: string): Promise<void> => {
  if (fs.existsSync(path.join(contentDir, "data/course.json"))) return
  const repoUrl = `${env.GIT_CONTENT_SOURCE}/${courseShortId}.git`
  console.log(color.cyan(`Cloning course content from ${repoUrl}...`))
  await run("git", ["clone", repoUrl, contentDir])
}

const ensureCleanTarget = (outDir: string, target: string): void => {
  const relative = path.relative(outDir, target)
  if (
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Refusing to clean path outside out-dir: ${target}`)
  }
}

const serveBuild = ({
  outDir,
  baseUrl,
  port
}: {
  outDir: string
  baseUrl: string
  port: number
}): void => {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public:        outDir,
      trailingSlash: true
    })
  })

  server.listen(port, () => {
    console.log("")
    console.log(color.green("Prefixed course build is ready."))
    console.log(`Serving: ${outDir}`)
    console.log(`Open:    http://localhost:${port}${baseUrl}/`)
    console.log("")
    console.log("Press Ctrl+C to stop the server.")
  })

  process.on("SIGINT", () => server.close())
  process.on("SIGTERM", () => server.close())
}

program
  .name("build-course-v3-prefixed")
  .description("Build a course-v3 site under a site-relative base URL.")
  .argument(
    "[shortid]",
    "Short-id of the course to build. Defaults to OCW_TEST_COURSE.",
    env.OCW_TEST_COURSE
  )
  .option(
    "--content-dir <path>",
    "Path to the course content root. Defaults to COURSE_CONTENT_PATH.",
    env.COURSE_CONTENT_PATH
  )
  .option(
    "--base-url <path>",
    "Site-relative course path. By default, this is derived from course metadata."
  )
  .option(
    "--base-url-prefix <path>",
    "Site-relative URL prefix to use when deriving --base-url.",
    env.COURSE_V3_BASE_URL_PREFIX
  )
  .option(
    "--config <path>",
    "Path to the ocw-course-v3 Hugo config. Defaults to COURSE_V3_HUGO_CONFIG_PATH.",
    env.COURSE_V3_HUGO_CONFIG_PATH
  )
  .option(
    "--out-dir <path>",
    "Root directory to serve from.",
    path.join(themesDir, "build/prefixed-course-v3")
  )
  .option(
    "--resource-base-url <url>",
    "Base URL to use for resource files. Defaults to RESOURCE_BASE_URL.",
    env.RESOURCE_BASE_URL
  )
  .option(
    "--static-api-base-url <url>",
    "Base URL to use for Hugo data fetches. Defaults to STATIC_API_BASE_URL.",
    env.STATIC_API_BASE_URL
  )
  .option("--log-level <level>", "Hugo log level.", "info")
  .option("--port <number>", "Port to use with --serve.", "8000")
  .option(
    "--clean",
    "Clean this build's static and course output first.",
    false
  )
  .option("--skip-webpack", "Reuse existing Webpack assets in out-dir.", false)
  .option("--serve", "Serve the output root after building.", false)
  .showHelpAfterError()
  .parse()

const main = async () => {
  const options = program.opts<Options>()
  const courseShortId = program.processedArgs[0] as string
  const outDir = path.resolve(options.outDir)
  const contentDir = resolveContentDir(options.contentDir, courseShortId)
  await ensureContent(contentDir, courseShortId)
  const configPath = path.resolve(options.config)
  const metadata = await readCourseMetadata(contentDir)
  const baseUrl = normalizeBaseUrl(
    options.baseUrl ||
      path.posix.join(
        "/",
        options.baseUrlPrefix,
        courseSlugFromMetadata(metadata, courseShortId)
      )
  )
  const staticOutputPath = path.join(outDir, "static_shared")
  const destination = path.join(outDir, baseUrl)
  const port = parseInt(options.port, 10)

  if (Number.isNaN(port)) {
    throw new Error("--port must be a number")
  }

  await fs.promises.mkdir(outDir, { recursive: true })

  if (options.clean) {
    ensureCleanTarget(outDir, staticOutputPath)
    ensureCleanTarget(outDir, destination)
    await fs.promises.rm(staticOutputPath, { recursive: true, force: true })
    await fs.promises.rm(destination, { recursive: true, force: true })
  }

  const commandEnv = {
    ...process.env,
    ...stringifyEnv(env),
    RESOURCE_BASE_URL:   options.resourceBaseUrl,
    STATIC_API_BASE_URL: options.staticApiBaseUrl
  } as NodeJS.ProcessEnv

  if (!options.skipWebpack) {
    console.log(color.cyan("Building Webpack assets..."))
    await run(
      yarnCommand,
      ["build:webpack", `--output-path=${staticOutputPath}`],
      {
        cwd: themesDir,
        env: commandEnv
      }
    )
  }

  console.log(color.cyan("Building Hugo course..."))
  await run(
    yarnCommand,
    [
      "hugo",
      "--source",
      contentDir,
      "--config",
      configPath,
      "--themesDir",
      themesDir,
      "--baseURL",
      baseUrl,
      "-d",
      destination,
      "--logLevel",
      options.logLevel,
      "--noBuildLock"
    ],
    {
      cwd: themesDir,
      env: commandEnv
    }
  )

  if (options.serve) {
    serveBuild({ outDir, baseUrl, port })
  } else {
    console.log("")
    console.log(color.green("Prefixed course build complete."))
    console.log(`Output root: ${outDir}`)
    console.log(`Course:      ${destination}`)
    console.log(
      `Serve with:  python3 -m http.server --directory ${outDir} ${port}`
    )
    console.log(`Open:        http://localhost:${port}${baseUrl}/`)
  }
}

main().catch(err => {
  console.error(color.red(err instanceof Error ? err.message : err))
  process.exit(1)
})
