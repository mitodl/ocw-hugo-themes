import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

test.describe("offline-v3 video gallery page", () => {
  test("video gallery page loads with v3 layout", async ({ page }) => {
    await page.goto(offlineFileUrl("/video_galleries/lecture-videos"))

    expect(page.url()).toContain("video_galleries/lecture-videos/index.html")
    await expect(page.locator("body")).toContainText("Lecture Videos")
  })

  test("gallery card links are package-local", async ({ page }) => {
    await page.goto(offlineFileUrl("/video_galleries/lecture-videos"))

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
    await page.goto(offlineFileUrl("/video_galleries/lecture-videos"))

    const titles = page.locator(".video-gallery-card-title")
    await expect(titles.first()).toBeVisible()
    await expect(titles.first()).not.toBeEmpty()
  })

  test("no remote YouTube thumbnail src attributes are present", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/video_galleries/lecture-videos"))

    // All img tags inside gallery cards must not point at img.youtube.com
    const galleryImgs = page.locator(".video-gallery-card-thumbnail img")
    const count = await galleryImgs.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const src = await galleryImgs.nth(i).getAttribute("src")
      expect(src).not.toMatch(/img\.youtube\.com/)
    }
  })

  test("thumbnail fallback uses local YouTube SVG placeholder", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/video_galleries/lecture-videos"))

    // Since test fixtures use remote thumbnail URLs, the offline build
    // should fall back to the bundled youtube.svg — assert the img is in DOM
    // with the expected fallback class (CSS may hide its dimensions)
    const fallbackImgs = page.locator(
      ".video-gallery-card-thumbnail img.youtube-logo-overlay"
    )
    const count = await fallbackImgs.count()
    expect(count).toBeGreaterThan(0)
    // Confirm the src is a local webpack asset URL, not a remote URL
    const src = await fallbackImgs.first().getAttribute("src")
    expect(src).not.toMatch(/^https?:\/\//)
  })

  test("clicking a gallery card navigates to local video resource page", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/video_galleries/lecture-videos"))

    const firstCard = page.locator(".video-gallery-card").first()
    const href = await firstCard.getAttribute("href")
    expect(href).toBeTruthy()

    await page.goto(new URL(href!, page.url()).href)
    expect(page.url()).toContain("resources/")
    expect(page.url()).toContain("index.html")
  })
})
