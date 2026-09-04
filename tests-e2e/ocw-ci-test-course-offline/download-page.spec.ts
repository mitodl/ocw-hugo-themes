import { test, expect } from "@playwright/test"
import { offlineV2FileUrl, expectLocalPackageHref } from "../util/offline-build"

test("Browse Resources CTA is present on download page", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/download"))
  const browseLink = page.locator(".download-course-link-button").first()
  await expect(browseLink).toBeVisible()
})

test("Online 'Download course' CTA is absent on download page", async ({
  page
}) => {
  await page.goto(offlineV2FileUrl("/download"))
  const downloadLink = page.getByRole("link", { name: "Download course" })
  await expect(downloadLink).toHaveCount(0)
})

test("Resource links on download page are local", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/download"))
  const resourceLinks = page.locator("a[href*='resources/']")
  expect(await resourceLinks.count()).toBeGreaterThan(0)
  await expectLocalPackageHref(resourceLinks.first())
})
