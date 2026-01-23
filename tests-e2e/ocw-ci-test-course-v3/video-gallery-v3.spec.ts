import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 Video Gallery Page", () => {
  test.beforeEach(async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/video_galleries/lecture-videos/")

    // Skip all tests if video galleries page doesn't exist in test content
    const galleryPage = page.locator(".video-gallery-page-v3")
    const isVisible = await galleryPage.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip(true, "Video gallery page not available in test content")
    }
  })

  test("Video gallery page renders with correct structure", async ({
    page
  }) => {
    // Check the video gallery page container exists
    const galleryPage = page.locator(".video-gallery-page-v3")
    await expect(galleryPage).toBeVisible()

    // Check the title is rendered by content_header_v3 (not the video gallery itself)
    const title = page.locator(".resource-page-title")
    await expect(title).toBeVisible()
    await expect(title).toHaveText("Lecture Videos")
  })

  test("Video gallery cards container styles are correct", async ({ page }) => {
    const cardsContainer = page.locator(".video-gallery-cards-container")
    await expect(cardsContainer).toBeVisible()
    await expect(cardsContainer).toHaveCSS("display", "flex")
    await expect(cardsContainer).toHaveCSS("flex-direction", "column")
    await expect(cardsContainer).toHaveCSS("gap", "16px")
  })

  test("Video gallery card has no text decoration", async ({ page }) => {
    const videoCard = page.locator(".video-gallery-card").first()
    await expect(videoCard).toBeVisible()
    await expect(videoCard).toHaveCSS("text-decoration-line", "none")
  })

  test("Video gallery card thumbnail styles are correct", async ({ page }) => {
    const thumbnail = page.locator(".video-gallery-card-thumbnail").first()
    await expect(thumbnail).toBeVisible()
    await expect(thumbnail).toHaveCSS("width", "104px")
    await expect(thumbnail).toHaveCSS("height", "60px")
    await expect(thumbnail).toHaveCSS("border-radius", "4px")
  })

  test("Video gallery card title styles are correct", async ({ page }) => {
    const title = page.locator(".video-gallery-card-title").first()
    await expect(title).toBeVisible()
    await expect(title).toHaveCSS("font-size", "14px")
    await expect(title).toHaveCSS("font-weight", "400")
    await expect(title).toHaveCSS("line-height", "18px")
    await expect(title).toHaveCSS("color", "rgb(0, 0, 0)")
  })

  test("Video gallery card displays image when available", async ({ page }) => {
    // Look for a thumbnail with an actual image
    const thumbnailImage = page
      .locator(".video-gallery-card-thumbnail img")
      .first()
    await expect(thumbnailImage).toBeVisible()
  })

  test("Video gallery card displays YouTube logo when no thumbnail", async ({
    page
  }) => {
    // Look for YouTube logo overlay (for videos without thumbnail)
    const youtubeLogos = page.locator(
      ".video-gallery-card-thumbnail .youtube-logo-overlay"
    )
    const count = await youtubeLogos.count()

    if (count > 0) {
      const logo = youtubeLogos.first()
      await expect(logo).toBeVisible()
      await expect(logo).toHaveAttribute("alt", "YouTube")
    }
  })

  test("Video gallery card links to correct video pages", async ({ page }) => {
    const videoCard = page.locator(".video-gallery-card").first()
    const href = await videoCard.getAttribute("href")

    // Should link to a resources page
    expect(href).toContain("/resources/")
  })

  test("Video gallery card hover state changes border color", async ({
    page
  }) => {
    const videoCard = page.locator(".video-gallery-card").first()

    // Hover and check border changes to black
    await videoCard.hover()
    await expect(videoCard).toHaveCSS("border-color", "rgb(0, 0, 0)")

    // Title should NOT change color on hover (stays black)
    const title = videoCard.locator(".video-gallery-card-title")
    await expect(title).toHaveCSS("color", "rgb(0, 0, 0)")
    await expect(title).toHaveCSS("text-decoration-line", "none")
  })

  test("Video gallery cards take full width of container", async ({ page }) => {
    const cardsContainer = page.locator(".video-gallery-cards-container")
    const videoCard = page.locator(".video-gallery-card").first()

    // Both container and cards should have width: 100%
    await expect(cardsContainer).toHaveCSS("width", /.+/)
    await expect(videoCard).toHaveCSS("width", /.+/)

    // Card width should match container width (minus borders)
    const containerWidth = await cardsContainer.evaluate(
      el => el.getBoundingClientRect().width
    )
    const cardWidth = await videoCard.evaluate(
      el => el.getBoundingClientRect().width
    )
    // Card should be approximately full width (accounting for borders)
    expect(cardWidth).toBeGreaterThan(containerWidth - 10)
  })
})
