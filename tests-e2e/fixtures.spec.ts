import { env, localPort } from "../env"
import * as path from "node:path"
import { promises as fsPromises } from "node:fs"
import fs from "fs"
import http from "http"
import https from "https"
import { test, expect } from "@playwright/test"
import recursiveReaddir from "recursive-readdir"

/**
 * See [fixtures readme](test-sites/__fixtures__/README.md). We want to make sure
 * that the fixtures are accurate
 */
test("The fixtures are what Hugo would produce.", async () => {
  const SKIP_DIRS = [
    "api/",
    /**
     * The two courses below are not built, they are just used as previews on
     * the test homepage.
     */
    "courses/some-featured-course",
    "courses/some-new-course"
  ]

  const fixtureDir = path.resolve(__dirname, "../test-sites/__fixtures__")
  const builtDir = path.resolve(__dirname, "../test-sites/tmp/dist")
  const filepaths: string[] = await recursiveReaddir(
    path.resolve(__dirname, "../test-sites/__fixtures__")
  )
  const jsonpaths = filepaths.filter(filepath => filepath.endsWith(".json"))
  const comparisons = await Promise.all(
    jsonpaths.map(async filepath => {
      const relative = path.relative(fixtureDir, filepath)
      if (SKIP_DIRS.some(dir => relative.startsWith(dir))) {
        return { fixture: null, built: null }
      }
      const fixtureText = await fsPromises.readFile(filepath, "utf-8")
      let builtText = ""
      if (env.PLAYWRIGHT_BASE_URL === `http://localhost:${localPort}`) {
        builtText = await fsPromises.readFile(
          path.join(builtDir, relative),
          "utf-8"
        )
      } else {
        const httpLibrary = env.PLAYWRIGHT_BASE_URL.includes("http://") ?
          http :
          https
        const url = new URL(relative, env.PLAYWRIGHT_BASE_URL)
        httpLibrary.get(url, res => {
          const downloadPath = path.join(builtDir, relative)
          const filePath = fs.createWriteStream(downloadPath)
          res.pipe(filePath)
          filePath.on("finish", async () => {
            filePath.close()
            builtText = await fsPromises.readFile(
              path.join(builtDir, relative),
              "utf-8"
            )
          })
        })
      }
      try {
        const fixtureJSON = JSON.parse(fixtureText)
        // The course image will be run through the resource_url.html partial
        // This results in the image path being prefixed with RESOURCE_BASE_URL
        if (fixtureJSON.hasOwnProperty("image_src")) {
          fixtureJSON["image_src"] = new URL(
            fixtureJSON["image_src"],
            env.RESOURCE_BASE_URL
          ).href
        }
        return {
          fixture: fixtureJSON,
          built:   JSON.parse(builtText)
        }
      } catch (err) {
        console.error(`Error parsing content of file ${filepath}`)
        throw err
      }
    })
  )

  comparisons.forEach(({ fixture, built }) => {
    expect(built).toEqual(fixture)
  })
})
