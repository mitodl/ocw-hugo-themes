import * as fs from "node:fs"

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
const getOptions = <T extends Record<string, string | number | boolean>>(
  opts: T
): string => {
  return Object.entries(opts)
    .map(([key, value]) => {
      if (typeof value === "boolean" && value) {
        return `--${key}`
      } else {
        return `--${key}=${value}`
      }
    })
    .join(" ")
}

export { dirHasContent, getOptions, exists }
