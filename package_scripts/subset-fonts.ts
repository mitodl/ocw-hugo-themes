/**
 * The fundamentals for this utility are derived from
 * https://stackoverflow.com/questions/64614572/creating-a-material-icons-subset
 */

import * as fs from "node:fs"
import * as path from "node:path"
import { readdir, stat, readFile } from "node:fs/promises"

import execSh from "exec-sh"
import { program } from "commander"

interface Options {
  fontsDir: string
}

/**
 * Check if a subset font could be created.
 *
 * @param fontPath Path to the font file.
 * @param codepointsPath Path to the codepoints file.
 * @returns (boolean) weather or not a subset font could to be created.
 */
function isEligibleForSubsetting(
  fontPath: string,
  codepointsPath: string
): boolean {
  const fontExt = path.extname(fontPath)

  if (![".ttf", ".woff", ".woff2"].includes(fontExt)) {
    if (fontExt !== ".codepoints") {
      console.error(`Unsupported font format for ${fontPath}`)
    }
    return false
  }

  if (fontPath.endsWith(`.subset${fontExt}`)) {
    console.warn(`Skipping existing subset ${fontPath}.`)
    return false
  }

  if (!fs.existsSync(fontPath) || !fs.existsSync(codepointsPath)) {
    console.warn(`Font or codepoints file not found for ${fontPath}`)
    return false
  }

  return true
}

/**
 * Creates a font subset.
 *
 * @param fontPath Path to the font file.
 * @param codepointsPath Path to the codepoints file.
 */
async function subsetFont(
  fontPath: string,
  codepointsPath: string
): Promise<void> {
  const fontExt = path.extname(fontPath)
  const outputPath = fontPath.replace(fontExt, `.subset${fontExt}`)

  try {
    // Read the codepoints file and create comma-separated unicode list
    const codepointsContent = await readFile(codepointsPath, "utf-8")
    const codepointsList = codepointsContent
      .split("\n")
      .map(line => line.trim().split(/\s+/)[1]) // Extract the second column (the codepoint)
      .filter(codepoint => codepoint) // Remove empty lines

    if (codepointsList.length === 0) {
      console.error(`No valid codepoints found in ${codepointsPath}`)
      return
    }

    let flavorArg = ""
    switch (fontExt) {
    case ".woff":
      flavorArg = "--flavor=woff"
      break
    case ".woff2":
      flavorArg = "--flavor=woff2"
      break
    }

    const unicodesArg = `--unicodes=5f-7a,30-39,${codepointsList.join(",")}`
    const command = `fonttools subset ${fontPath} --output-file=${outputPath} --no-layout-closure ${unicodesArg} ${flavorArg}`

    const { stderr } = await execSh.promise(command)

    if (stderr) {
      console.error(`Error subsetting ${fontPath}: ${stderr}`)
    } else {
      console.log(`Subset font saved as ${outputPath}`)
    }
  } catch (error) {
    console.error(`Error subsetting ${fontPath}: ${error}`)
  }
}

/**
 * The entry point for the subsetting command.
 *
 * @param fontsDir Directory path where fonts reside.
 */
async function main({ fontsDir }: Options) {
  try {
    const files = await readdir(fontsDir)
    console.log(`Processing files: ${files}`)

    for (const file of files) {
      const fontPath = path.join(fontsDir, file)
      const codepointsPath = fontPath.replace(/\.\w+$/, ".subset.codepoints")
      const fontStat = await stat(fontPath)

      if (
        fontStat.isFile() &&
        isEligibleForSubsetting(fontPath, codepointsPath)
      ) {
        await subsetFont(fontPath, codepointsPath)
      }
    }
  } catch (error) {
    console.error("Error reading fonts directory:", error)
  }
}

program
  .description(
    `Create font subsets.

This commands scans a directory for \`<font name>\` and \`<font name>.subset.codepoints\` files.
Then uses these files to generate \`<font name>.subset.<font type>\` subsets.

Supports ttf, woff, and woff2.
  `
  )
  .option(
    "--fonts-dir <path>",
    "Fonts directory.",
    "base-theme/assets/fonts/material-design-icons"
  )
  .action(main)

program.parse()
