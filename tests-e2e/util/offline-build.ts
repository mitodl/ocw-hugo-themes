import * as path from "node:path"
import LocalOCW, { fromRoot } from "../LocalOcw"
import { TEST_SITES } from "./test_sites"

/**
 * Absolute path to the directory where the offline-v3 site is built.
 * All beforeAll hooks write here; Hugo builds are deterministic so
 * concurrent writes produce identical output.
 */
const OFFLINE_V3_BUILD_ROOT = fromRoot("./test-sites/tmp/offline-v3-dist")

/**
 * Build the offline-v3 course site and return the absolute path to its root
 * directory (i.e. the directory that contains index.html for "/").
 *
 * Call this inside a `test.beforeAll` hook in each offline spec file.
 * The fixturesPort value below matches the port started by global-setup so
 * that STATIC_API_BASE_URL resolves correctly if the server happens to be
 * running; the build itself does not require an active HTTP server.
 */
export const buildOfflineV3Site = async (): Promise<string> => {
  const ocw = new LocalOCW({
    rootDestinationDir: OFFLINE_V3_BUILD_ROOT,
    fixturesPort:       4321
  })
  await ocw.buildSite("course-v3-offline")
  const site = TEST_SITES["course-v3-offline"]
  return path.join(OFFLINE_V3_BUILD_ROOT, "courses", site.name)
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
  return `file://${filePath}`
}
