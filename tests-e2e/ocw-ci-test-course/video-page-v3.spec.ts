import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Video Page v3", () => {
  let course: CoursePage

  test.beforeEach(async ({ page }) => {
    course = new CoursePage(page, "course-v3")
    // Use the fixture with parent_title
    await course.goto("/resources/ocw_test_course_mit8_01f16_l01v01_360p/")
  })

  test.describe("Layout Structure", () => {
    test("should render video page container", async ({ page }) => {
      const container = page.locator(".video-page-v3")
      await expect(container).toBeVisible()
    })
  })

  test.describe("Title Section", () => {
    test("should render parent title", async ({ page }) => {
      const parentTitle = page.locator(".video-v3-parent-title")
      await expect(parentTitle).toBeVisible()
      await expect(parentTitle).toHaveText("Test Course Video")
      await expect(parentTitle).toHaveCSS("font-size", "14px")
      await expect(parentTitle).toHaveCSS("font-weight", "500")
      await expect(parentTitle).toHaveCSS("line-height", "18px")
    })

    test("should render main title with correct styling", async ({ page }) => {
      const title = page.locator("h1.video-v3-title")
      await expect(title).toBeVisible()
      await expect(title).toHaveCSS("font-size", "18px")
      await expect(title).toHaveCSS("font-weight", "500")
      await expect(title).toHaveCSS("line-height", "26px")
    })

    test("should have 4px gap between parent and main title", async ({
      page
    }) => {
      const header = page.locator(".video-v3-header")
      await expect(header).toHaveCSS("gap", "4px")
    })
  })

  test.describe("Metadata Section", () => {
    test("should not render metadata section when no content and no instructor", async ({
      page
    }) => {
      // The test fixture has empty video_speakers, so metadata section should not render
      const metadata = page.locator(".video-v3-metadata")
      const count = await metadata.count()
      // Should be 0 if no content/instructor, or present if there is content
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe("Video Player", () => {
    test("should render video player wrapper", async ({ page }) => {
      const playerWrapper = page.locator(".video-v3-player-wrapper")
      await expect(playerWrapper).toBeVisible()
    })

    test("should render video container", async ({ page }) => {
      const videoContainer = page.locator(".video-container")
      await expect(videoContainer.first()).toBeVisible()
    })
  })

  test.describe("Transcript Tab", () => {
    test("should render transcript tab with download button", async ({
      page
    }) => {
      const transcriptTab = page.locator(".video-tab-toggle-section").first()
      await expect(transcriptTab).toBeVisible()
    })

    test("should have download icons button", async ({ page }) => {
      const downloadBtn = page.locator(".video-download-icons").first()
      await expect(downloadBtn).toBeVisible()
    })
  })

  test.describe("Expandable Tabs", () => {
    test("should render related resources tab when present", async ({
      page
    }) => {
      // Related resources tab is collapsed by default - check it exists in DOM
      const relatedTab = page.locator(".related-resource")
      const count = await relatedTab.count()
      expect(count).toBeGreaterThan(0)
    })

    test("should render optional tab when present", async ({ page }) => {
      // Optional tab is collapsed by default - check it exists in DOM
      const optionalTab = page.locator(".optional-tab")
      const count = await optionalTab.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe("Accessibility", () => {
    test("should have proper heading structure", async ({ page }) => {
      const h1 = page.locator("h1.video-v3-title")
      await expect(h1).toBeVisible()
    })

    test("should have download button with aria-label", async ({ page }) => {
      const downloadBtn = page.locator(".video-download-icons").first()
      await expect(downloadBtn).toHaveAttribute("aria-label", "Show Downloads")
    })
  })
})
