import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 Course Info drawer focus management", () => {
  test("returns focus to the toggle button when closed", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    const openButton = page.locator("#desktop-course-drawer-button")
    // Scoped to the desktop drawer container: course_info.html is also
    // rendered (inPanel=true) inside the mobile drawer markup in
    // mobile_course_info.html, which reuses the same close-button id and
    // would otherwise make this locator ambiguous.
    const closeButton = page.locator(
      "#desktop-course-drawer #desktop-course-drawer-button-close"
    )

    // The drawer is open by default for first-time visitors (no stored preference).
    await expect(closeButton).toBeVisible()
    await expect(closeButton).toHaveAttribute("aria-label", "Close Course Info")

    await closeButton.click()
    await expect(openButton).toBeFocused()
  })

  test("moves focus to the close button when opened", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    const openButton = page.locator("#desktop-course-drawer-button")
    const closeButton = page.locator(
      "#desktop-course-drawer #desktop-course-drawer-button-close"
    )

    // Close it first since the drawer is open by default, then reopen it.
    await closeButton.click()
    await expect(openButton).toBeFocused()

    await openButton.click()
    await expect(closeButton).toBeFocused()
  })

  test("close button aria-expanded matches the restored initial state", async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    // The drawer is open by default for first-time visitors (no stored
    // preference), and the close button's initial aria-expanded is
    // hardcoded "false" server-side, so this only passes if the client-side
    // state restoration also syncs the close button, not just the toggle.
    const closeButton = page.locator(
      "#desktop-course-drawer #desktop-course-drawer-button-close"
    )
    await expect(closeButton).toHaveAttribute("aria-expanded", "true")
  })
})
