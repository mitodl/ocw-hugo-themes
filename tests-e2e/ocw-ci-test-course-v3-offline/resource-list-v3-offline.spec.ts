import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

test.describe("offline-v3 resource list page", () => {
  test("resource list page loads with v3 card structure", async ({ page }) => {
    await page.goto(offlineFileUrl("/lists/a-resource-list"))

    expect(page.url()).toContain("lists/a-resource-list/index.html")
    await expect(page.locator("body")).toContainText("A resource list")
    await expect(page.locator(".resource-card").first()).toBeVisible()
  })

  test("resource card titles navigate to local resource pages", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/lists/a-resource-list"))

    const cardTitles = page.locator(".resource-card-title")
    const count = await cardTitles.count()
    expect(count).toBeGreaterThan(0)

    // Every card title must be a relative, package-local link
    for (let i = 0; i < count; i++) {
      const href = await expectLocalPackageHref(cardTitles.nth(i))
      expect(href).toContain("resources/")
      expect(href).toContain("index.html")
    }
  })

  test("resource card download links point to local static_resources", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/lists/a-resource-list"))

    // Download links are the thumbnail-link anchors that have the `download` attribute
    const downloadLinks = page.locator(".resource-card-thumbnail-link[download]")
    const count = await downloadLinks.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await expectLocalPackageHref(downloadLinks.nth(i))
      expect(href).toContain("static_resources/")
    }
  })

  test("resource card structure is v3-consistent", async ({ page }) => {
    await page.goto(offlineFileUrl("/lists/a-resource-list"))

    // V3 resource cards have badge, thumbnail, and title areas
    const firstCard = page.locator(".resource-card").first()
    await expect(firstCard.locator(".resource-card-type")).toBeVisible()
    await expect(firstCard.locator(".resource-card-title")).toBeVisible()
  })

  test("See all link on download page is package-local", async ({ page }) => {
    await page.goto(offlineFileUrl("/download"))

    // Expand a section to reveal See all link if it exists
    const seeAll = page.locator(".see-all-link").first()
    if ((await seeAll.count()) > 0) {
      const href = await expectLocalPackageHref(seeAll)
      expect(href).not.toMatch(/^https?:\/\//)
      expect(href).not.toMatch(/^\//)
    }
  })
})
