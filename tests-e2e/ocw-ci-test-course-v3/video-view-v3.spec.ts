import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 Video View Page", () => {
  test.beforeEach(async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/ocw_test_course_mit8_01f16_l01v01_360p")
  })

  test("Video view page renders with correct structure", async ({ page }) => {
    // Check the video view page container exists
    const videoPage = page.locator(".video-view-page-v3")
    await expect(videoPage).toBeVisible()
  })

  test("Video view header displays category and title", async ({ page }) => {
    // Check the header section exists
    const header = page.locator(".video-view-header")
    await expect(header).toBeVisible()

    // Check title container
    const titleContainer = page.locator(".video-view-title-container")
    await expect(titleContainer).toBeVisible()
  })

  test("Video view category styles are correct", async ({ page }) => {
    const category = page.locator(".video-view-category")
    if ((await category.count()) > 0) {
      await expect(category).toHaveCSS("font-size", "14px")
      await expect(category).toHaveCSS("font-weight", "500")
      await expect(category).toHaveCSS("line-height", "18px")
      await expect(category).toHaveCSS("color", "rgb(0, 0, 0)")
    }
  })

  test("Video view title styles are correct", async ({ page }) => {
    const title = page.locator(".video-view-title")
    await expect(title).toBeVisible()
    await expect(title).toHaveCSS("font-size", "18px")
    await expect(title).toHaveCSS("font-weight", "500")
    await expect(title).toHaveCSS("line-height", "26px")
    await expect(title).toHaveCSS("color", "rgb(0, 0, 0)")
  })

  test("Video view header has correct gap", async ({ page }) => {
    const header = page.locator(".video-view-header")
    await expect(header).toHaveCSS("gap", "16px")
  })

  test("Video view meta block has correct styling", async ({ page }) => {
    const metaBlock = page.locator(".video-view-meta-block").first()
    const count = await metaBlock.count()
    if (count > 0) {
      await expect(metaBlock).toHaveCSS("font-size", "14px")
      await expect(metaBlock).toHaveCSS("line-height", "22px")
    }
  })

  test("Last meta block has no bottom margin on its last paragraph", async ({
    page
  }) => {
    // The last meta block (instructor) should have no bottom margin on its last p
    const lastMetaBlock = page.locator(
      ".video-view-header > .video-view-meta-block:last-child"
    )
    await expect(lastMetaBlock).toBeVisible()

    const lastParagraph = lastMetaBlock.locator("p:last-of-type")
    if ((await lastParagraph.count()) > 0) {
      await expect(lastParagraph).toHaveCSS("margin-bottom", "0px")
    }
  })

  test("Video view content section exists", async ({ page }) => {
    const content = page.locator(".video-view-content")
    await expect(content).toBeVisible()
  })

  test("Video player is rendered", async ({ page }) => {
    // Check video player wrapper exists
    const videoWrapper = page.locator(".video-player-wrapper")
    await expect(videoWrapper).toBeVisible()
  })

  test("Video page layout has correct gap", async ({ page }) => {
    const videoPage = page.locator(".video-view-page-v3")
    await expect(videoPage).toHaveCSS("gap", "40px")
  })

  test("Video page has correct background color", async ({ page }) => {
    const videoPage = page.locator(".video-view-page-v3")
    await expect(videoPage).toHaveCSS("background-color", "rgb(255, 255, 255)")
  })

  test("Resource page container has no extra margins for video", async ({
    page
  }) => {
    const container = page.locator(".resource-page-container")
    await expect(container).toHaveCSS("margin-top", "0px")
    await expect(container).toHaveCSS("padding-right", "0px")
  })
})

test.describe("Course v3 Video View Page - No Instructor", () => {
  test("Description has no bottom margin when instructor is missing", async ({
    page
  }) => {
    // Use a video without instructor
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/ocw_test_course_mit8_01f16_l26v02_360p")

    // When instructor is missing, description becomes the last meta block
    const lastMetaBlock = page.locator(
      ".video-view-header > .video-view-meta-block:last-child"
    )

    // The last paragraph in the last meta block should have no bottom margin
    const lastParagraph = lastMetaBlock.locator("p:last-of-type")
    if ((await lastParagraph.count()) > 0) {
      await expect(lastParagraph).toHaveCSS("margin-bottom", "0px")
    }
  })
})
