import { test, expect } from "@playwright/test"
import { offlineV2FileUrl } from "../util/offline-build"

test("Homepage loads with course title", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/"))
  const title = page.locator("h1, .course-title").first()
  await expect(title).toBeVisible()
})

test("Assignments page loads", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/pages/assignments"))
  await expect(page.locator("body")).toBeVisible()
})

test("Resource list page loads", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/lists/a-resource-list"))
  await expect(page.locator("body")).toBeVisible()
})

test("Resource page loads", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/resources/file_pdf"))
  await expect(page.locator("body")).toBeVisible()
})

test("Page loads v2 offline bundle, not v3 bundle", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/"))
  const v2Bundle = page.locator("script[src*='course_offline']")
  const v3Bundle = page.locator("script[src*='course_offline_v3']")
  await expect(v2Bundle.first()).toBeAttached()
  await expect(v3Bundle).toHaveCount(0)
})
