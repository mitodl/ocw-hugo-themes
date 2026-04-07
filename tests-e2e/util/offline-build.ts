import * as fs from "node:fs"
import * as path from "node:path"
import { pathToFileURL } from "node:url"
import LocalOCW, { fromRoot } from "../LocalOcw"
import { TEST_SITES } from "./test_sites"

/**
 * Absolute path to the directory where the offline-v3 site is built.
 * This matches the rootDestinationDir used by the main LocalOCW instance in
 * global-setup so that the site built there is reused by spec beforeAll hooks.
 */
const OFFLINE_V3_BUILD_ROOT = fromRoot("./test-sites/tmp/dist")

/**
 * Build the offline-v3 course site and return the absolute path to its root
 * directory (i.e. the directory that contains index.html for "/").
 *
 * Call this inside a `test.beforeAll` hook in each offline spec file.
 * When global-setup has already built the site the Hugo invocation is
 * skipped, so concurrent workers do not race on the same destination.
 */
export const buildOfflineV3Site = async (): Promise<string> => {
  const site = TEST_SITES["course-v3-offline"]
  const siteDir = path.join(OFFLINE_V3_BUILD_ROOT, "courses", site.name)
  if (!fs.existsSync(path.join(siteDir, "index.html"))) {
    const ocw = new LocalOCW({
      rootDestinationDir: OFFLINE_V3_BUILD_ROOT,
      fixturesPort:       4321
    })
    await ocw.buildSite("course-v3-offline")
  }
  return siteDir
}

/**
 * Construct a `file://` URL for a route within a built offline site.
 *
 * @param siteDir  Absolute path returned by `buildOfflineV3Site()`
 * @param route    Site-root-relative path, e.g. "/" or "/pages/assignments"
 */
export const offlineFileUrl = (siteDir: string, route = "/"): string => {
  const trimmed = route.replace(/^\//, "").replace(/\/$/, "")
  const filePath = trimmed ?
    path.join(siteDir, trimmed, "index.html") :
    path.join(siteDir, "index.html")
  return pathToFileURL(filePath).href
}
