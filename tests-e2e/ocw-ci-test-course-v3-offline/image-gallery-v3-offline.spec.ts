import { test, expect } from "@playwright/test"
import { offlineV3FileUrl, expectLocalPackageHref } from "../util"

/**
 * file://-only: the gallery's markup, lightbox and warning dialog are covered
 * by the unified image-gallery-v3.spec.ts (siteAlias "course-v3-offline",
 * served over HTTP). This file exists only to verify that the URLs resolve
 * against the package as it is actually opened from disk, which the
 * HTTP-served test cannot exercise — every site is served from one shared
 * root there, so a relative path that climbs too high lands back inside that
 * root and still resolves.
 */
test.describe("offline-v3 image gallery — file:// path resolution", () => {
  test("image gallery page loads", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/pages/image-gallery"))

    expect(page.url()).toContain("pages/image-gallery/index.html")
    await expect(page.locator("body")).toContainText("Image Gallery")
  })

  test("gallery images and links are package-local", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/pages/image-gallery"))

    const link = page.locator("a.image-gallery__link").first()
    const href = await expectLocalPackageHref(link)
    expect(href).toContain("static_resources/example_jpg.jpg")

    const src = await page
      .locator("img.image-gallery__thumb")
      .first()
      .getAttribute("src")
    expect(src).toContain("static_resources/example_jpg.jpg")
    expect(src).not.toMatch(/^https?:\/\//)

    // picture_element.html skips Fastly optimization for relative paths, so
    // offline serves the original file with no srcset. Parity with the old
    // behaviour, not a regression.
    const srcset = await page
      .locator("img.image-gallery__thumb")
      .first()
      .getAttribute("srcset")
    expect(srcset).toBeNull()
  })

  test("gallery uses v3 offline bundle", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/pages/image-gallery"))

    await expect(page.locator('script[src*="course_offline_v3"]')).toHaveCount(
      1
    )
  })

  test("shortcode resource links on shortcode-demos are package-local", async ({
    page
  }) => {
    await page.goto(offlineV3FileUrl("/pages/shortcode-demos"))

    const resourceLink = page.getByRole("link", {
      name: "Resource link to First Test Page"
    })
    const href = await expectLocalPackageHref(resourceLink)
    expect(href).toContain("first-test-page-title/index.html")
  })
})
