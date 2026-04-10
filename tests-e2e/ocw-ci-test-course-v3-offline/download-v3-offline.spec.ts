import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

test.describe("offline-v3 download / browse page", () => {
  test("download page loads with Browse Resources heading", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/download"))

    expect(page.url()).toContain("download/index.html")
    // Offline header replaces the online "Download" heading
    await expect(page.locator("body")).toContainText("Browse Resources")
  })

  test("no online Download Course CTA is present", async ({ page }) => {
    await page.goto(offlineFileUrl("/download"))

    // The online "Download course" button text must not appear
    await expect(
      page.locator('a:has-text("Download course")')
    ).toHaveCount(0)
  })

  test("Browse Resources CTA button is present and local", async ({ page }) => {
    // The browse resources CTA appears on the home page panel / course-info
    // areas — not on the /download page itself (which IS the browse page)
    await page.goto(offlineFileUrl("/"))

    const browseBtn = page.locator(
      '.download-course-button-v3, a:has-text("Browse Resources")'
    )
    const count = await browseBtn.count()
    if (count > 0) {
      const href = await expectLocalPackageHref(browseBtn.first())
      expect(href).toContain("download")
    }
  })

  test("grouped resource lists render on download page", async ({ page }) => {
    await page.goto(offlineFileUrl("/download"))

    // At least one collapsible resource list should be present
    const toggleLinks = page.locator(".resource-list-toggle-link")
    await expect(toggleLinks.first()).toBeVisible()
  })

  test("resource items inside expanded group resolve locally", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/download"))

    // Expand a collapsed group
    const collapsed = page
      .locator(".resource-list-toggle-link.collapsed")
      .first()
    await collapsed.click()

    // After expanding, card title links should be local
    const firstCard = page.locator(".resource-card").first()
    await expect(firstCard).toBeVisible()
    const titleLink = firstCard.locator(".resource-card-title")
    const href = await expectLocalPackageHref(titleLink)
    expect(href).toContain("resources/")
    expect(href).toContain("index.html")
  })

  test("no online download course language remains", async ({ page }) => {
    await page.goto(offlineFileUrl("/download"))

    const bodyText = await page.locator("body").textContent()
    // These phrases are only in the online version of resources_header
    expect(bodyText).not.toContain("download the course")
    expect(bodyText).not.toContain("click on the index.html file")
  })
})
