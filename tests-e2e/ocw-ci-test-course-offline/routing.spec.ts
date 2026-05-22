import { test, expect } from "@playwright/test"
import { offlineV2FileUrl, expectLocalPackageHref } from "../util/offline-build"

test("Desktop nav links are relative (package-local)", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/"))
  const navLinks = page.locator(".desktop-course-toc a[href]")
  const count = await navLinks.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < Math.min(count, 5); i++) {
    await expectLocalPackageHref(navLinks.nth(i))
  }
})

test("Resource card title on list page is local", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/lists/a-resource-list"))
  const cardLinks = page.locator(".resource-card a[href], .resource-list-item a[href]").first()
  await expectLocalPackageHref(cardLinks)
})

test("Download page resource links are local", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/download"))
  const resourceLinks = page.locator("a[href*='resources/']").first()
  await expectLocalPackageHref(resourceLinks)
})

test("Shortcode resource_link on shortcode-demos page is local", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/pages/shortcode-demos"))
  await expect(page.locator("body")).toBeVisible()
  const resourceLinks = page.locator("a[href*='resources/']")
  const count = await resourceLinks.count()
  if (count > 0) {
    await expectLocalPackageHref(resourceLinks.first())
  }
})
