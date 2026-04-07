import { test, expect } from "@playwright/test"
import { buildOfflineV3Site, offlineFileUrl } from "../util"

test.describe("offline-v3 smoke", () => {
  let siteDir: string

  test.beforeAll(async () => {
    siteDir = await buildOfflineV3Site()
  })

  test("offline-v3 home page loads offline-v3 assets", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/"))

    await expect(page.locator("body")).toContainText("OCW CI Test Course")
    await expect(page.locator('link[href*="course_offline_v3"]')).toHaveCount(1)
    await expect(
      page.locator('script[src*="course_offline_v3"]')
    ).toHaveCount(1)
  })

  test("offline-v3 generic page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/assignments"))

    expect(page.url()).toContain("pages/assignments/index.html")
    await expect(page.locator("body")).toContainText("Section 2")
  })

  test("offline-v3 resource list page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/lists/a-resource-list"))

    expect(page.url()).toContain("lists/a-resource-list/index.html")
    await expect(page.locator("body")).toContainText("A resource list")
  })

  test("offline-v3 resource page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/resources/file_pdf"))

    expect(page.url()).toContain("resources/file_pdf/index.html")
    await expect(page.locator("body")).toContainText("file.pdf")
  })
})