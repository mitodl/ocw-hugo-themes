import * as path from "node:path"
import { pathToFileURL } from "node:url"
import { Locator, expect } from "@playwright/test"
import { fromRoot } from "../LocalOcw"
import { TEST_SITES } from "./test_sites"

const OFFLINE_V3_BUILD_ROOT = fromRoot("./test-sites/tmp/dist")

const site = TEST_SITES["course-v3-offline"]

/**
 * Absolute path to the built offline-v3 course site root.
 * The site is built by global-setup before any worker starts.
 */
export const offlineV3SiteDir = path.join(
  OFFLINE_V3_BUILD_ROOT,
  "courses",
  site.name
)

/**
 * Construct a `file://` URL for a route within the built offline site.
 *
 * @param route  Site-root-relative path, e.g. "/" or "/pages/assignments"
 */
export const offlineFileUrl = (route = "/"): string => {
  const trimmed = route.replace(/^\//, "").replace(/\/$/, "")
  const filePath = trimmed ?
    path.join(offlineV3SiteDir, trimmed, "index.html") :
    path.join(offlineV3SiteDir, "index.html")
  return pathToFileURL(filePath).href
}

/**
 * Assert that a locator's href is a package-local relative URL (not absolute,
 * not root-relative). Returns the href string for further assertions.
 */
export const expectLocalPackageHref = async (locator: Locator) => {
  const href = await locator.getAttribute("href")
  expect(href).toBeTruthy()
  expect(href).not.toMatch(/^https?:\/\//)
  expect(href).not.toMatch(/^\//)
  return href as string
}
