import { test, expect } from "@playwright/test"
import { offlineV3FileUrl, expectLocalPackageHref } from "../util"

test.describe("offline-v3 video gallery page", () => {
  test("video gallery page loads with v3 layout", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/video_galleries/lecture-videos"))

    expect(page.url()).toContain("video_galleries/lecture-videos/index.html")
    await expect(page.locator("body")).toContainText("Lecture Videos")
  })

  test("gallery card links are package-local", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/video_galleries/lecture-videos"))

    const cards = page.locator(".video-gallery-card")
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const href = await expectLocalPackageHref(cards.nth(i))
      expect(href).toContain("resources/")
      expect(href).toContain("index.html")
    }
  })

  test("gallery card titles are present", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/video_galleries/lecture-videos"))

    const titles = page.locator(".video-gallery-card-title")
    await expect(titles.first()).toBeVisible()
    await expect(titles.first()).not.toBeEmpty()
  })

  test("gallery card thumbnails are present", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/video_galleries/lecture-videos"))

    // The online v3 template shows the thumbnail if video_thumbnail_file is
    // set (including remote img.youtube.com URLs), falling back to the local
    // YouTube SVG only when no thumbnail is defined. Test fixtures have
    // video_thumbnail_file set, so img elements should be present.
    const galleryImgs = page.locator(".video-gallery-card-thumbnail img")
    const count = await galleryImgs.count()
    expect(count).toBeGreaterThan(0)
  })

  test("clicking a gallery card navigates to local video resource page", async ({
    page
  }) => {
    await page.goto(offlineV3FileUrl("/video_galleries/lecture-videos"))

    const firstCard = page.locator(".video-gallery-card").first()
    const href = await firstCard.getAttribute("href")
    expect(href).toBeTruthy()

    await page.goto(new URL(href!, page.url()).href)
    expect(page.url()).toContain("resources/")
    expect(page.url()).toContain("index.html")
  })
})
