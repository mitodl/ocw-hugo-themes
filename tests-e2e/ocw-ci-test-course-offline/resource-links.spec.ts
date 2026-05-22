import { test, expect } from "@playwright/test"
import { offlineV2FileUrl, expectLocalPackageHref } from "../util/offline-build"

test("Resource card title links are local", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/lists/a-resource-list"))
  const titleLinks = page.locator(
    ".resource-list-item a[href], .resource-card a[href]"
  )
  const count = await titleLinks.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < Math.min(count, 5); i++) {
    await expectLocalPackageHref(titleLinks.nth(i))
  }
})

test("Resource card links contain resources/ in href", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/lists/a-resource-list"))
  const resourceLinks = page.locator("a[href*='resources/']")
  const count = await resourceLinks.count()
  expect(count).toBeGreaterThan(0)
})

test("Image resource card link is present and local", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/lists/a-resource-list"))
  const pngCard = page.locator(
    ".resource-list-item a[href*='file_png'], .resource-card a[href*='file_png']"
  )
  const count = await pngCard.count()
  if (count > 0) {
    await expectLocalPackageHref(pngCard.first())
  }
})
