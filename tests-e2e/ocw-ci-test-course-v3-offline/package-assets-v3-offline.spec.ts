import { test, expect } from "@playwright/test"
import { offlineV3FileUrl } from "../util"

/**
 * file://-only: asserts the packaged CSS and JS actually load and apply when
 * the package is opened from disk, rather than that their URLs look correct.
 *
 * This cannot be folded into the siteAlias specs. Every test site is served
 * from one shared root over HTTP, so a relative path that climbs too high
 * lands back inside that root and still resolves. Only file:// exercises the
 * package the way a downloaded course is actually used.
 *
 * static_resources is excluded from the broken-request check: the test course
 * ships markdown only, and ocw-studio populates that directory in production,
 * so those files are absent here by design.
 */

const ROUTES = [
  ["site root", "/"],
  ["nested page", "/lists/a-resource-list"]
] as const

const isPackageAsset = (url: string) =>
  url.startsWith("file://") && !url.includes("/static_resources/")

test.describe("Course v3 offline package assets", () => {
  for (const [label, route] of ROUTES) {
    test(`stylesheet and bundle load from the ${label}`, async ({ page }) => {
      const broken: string[] = []
      page.on("requestfailed", request => {
        if (isPackageAsset(request.url())) broken.push(request.url())
      })

      await page.goto(offlineV3FileUrl(route))

      expect(broken).toEqual([])

      // Proves the stylesheet resolved and applied. An unstyled page falls
      // back to the browser default serif instead.
      await expect(page.locator("body")).toHaveCSS(
        "font-family",
        /neue-haas-grotesk-text/
      )

      // Proves the bundle resolved and executed, along with its jQuery and
      // Bootstrap dependencies.
      const bundleRan = await page.evaluate(() => {
        const jq = (
          window as unknown as {
            jQuery?: { fn?: Record<string, unknown> }
          }
        ).jQuery
        return typeof jq?.fn?.modal === "function"
      })
      expect(bundleRan).toBe(true)
    })
  }
})
