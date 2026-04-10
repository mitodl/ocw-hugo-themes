import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

test.describe("offline-v3 image gallery page", () => {
  test("image gallery page loads", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    expect(page.url()).toContain("pages/image-gallery/index.html")
    await expect(page.locator("body")).toContainText("Image Gallery")
  })

  test("image gallery container is present", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    const gallery = page.locator(".image-gallery")
    await expect(gallery).toBeVisible()
  })

  test("gallery data-base-url is a local relative path", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    const gallery = page.locator(".image-gallery")
    const baseUrl = await gallery.getAttribute("data-base-url")

    expect(baseUrl).toBeTruthy()
    // Must not be an absolute http URL — must be local/relative
    expect(baseUrl).not.toMatch(/^https?:\/\//)
  })

  test("gallery nanogallery2 init script is present on the page", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    // The gallery script fires window.initNanogallery2 on load
    const pageContent = await page.content()
    expect(pageContent).toContain("initNanogallery2")
  })

  test("gallery uses v3 offline bundle", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    await expect(page.locator('script[src*="course_offline_v3"]')).toHaveCount(
      1
    )
  })

  test("shortcode resource links on shortcode-demos are package-local", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/pages/shortcode-demos"))

    const resourceLink = page.getByRole("link", {
      name: "Resource link to First Test Page"
    })
    const href = await expectLocalPackageHref(resourceLink)
    expect(href).toContain("first-test-page-title/index.html")
  })
})
