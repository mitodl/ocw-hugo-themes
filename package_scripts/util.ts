import { ExecOptions } from "node:child_process"
import * as fs from "node:fs"
import execShCb from "exec-sh"

const execSh = execShCb.promise

const dirHasContent = async (dirpath: string): Promise<boolean> => {
  try {
    const files = await fs.promises.readdir(dirpath)
    return files.length > 0
  } catch (err) {
    return false
  }
}

/**
 * Check if file at `filepath` exists and is accessible.
 */
const exists = async (filepath: string): Promise<boolean> => {
  try {
    await fs.promises.access(filepath)
    return true
  } catch (err) {
    return false
  }
}

/**
 * Turn an object into CLI options.
 *
 * @example
 * ```ts
 * getOptions({ dog: "woof", cat: "meow", loud: true, angry: false })
 * // => '--dog=woof --cat=meow --loud'
 * ```
 */
const getOptions = <
  T extends Record<string, string | number | boolean | undefined>
>(
    opts: T
  ): string => {
  return Object.entries(opts)
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        return value ? `--${key}` : ""
      } else if (value === undefined) {
        return ""
      } else {
        return `--${key}=${value}`
      }
    })
    .join(" ")
}

type HugoOptions = {
  baseURL?: string
  themesDir: string
  config: string
  destination: string
  verbose?: boolean
  environment?: "development" | "production"
  cacheDir?: string
}
/**
 * Run Hugo in a child process with the given options. See [hugo](https://gohugo.io/commands/hugo/)
 * for more.
 */
const hugo = (hugoOptions: HugoOptions, execOptions: ExecOptions) => {
  const flags = getOptions(hugoOptions)
  return execSh(`yarn hugo ${flags} --verbose`, execOptions)
}

export type { HugoOptions }
export { dirHasContent, getOptions, exists, hugo }
