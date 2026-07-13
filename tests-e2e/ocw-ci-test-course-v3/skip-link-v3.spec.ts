import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 skip to main content link", () => {
  test("is the first focusable element and moves focus to main content when activated", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    const skipLink = page.locator("a.skip-to-main-content")
    await expect(skipLink).toHaveAttribute("href", "#course-content-section")
    await expect(skipLink).toHaveText("Skip to main content")
    await expect(skipLink).not.toBeVisible()

    await page.keyboard.press("Tab")
    await expect(skipLink).toBeVisible()
    await expect(skipLink).toBeFocused()

    await page.keyboard.press("Enter")
    await expect(course.withinContent()).toBeFocused()
  })
})
