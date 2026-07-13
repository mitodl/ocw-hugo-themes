import { Page, test, expect } from "@playwright/test"
import { CoursePage } from "../util"

/**
 * Asserts that the skip-to-main-content link is hidden until focused, is
 * reachable as the first Tab stop, and moves focus into the course content
 * region when activated.
 */
async function assertSkipLinkWorks(page: Page, course: CoursePage) {
  const skipLink = page.locator("a.skip-to-main-content")
  await expect(skipLink).toHaveAttribute("href", "#course-content-section")
  await expect(skipLink).toHaveText("Skip to main content")

  // Bootstrap's .sr-only hides content with a clipped 1x1px box (not
  // display:none), so it stays in the accessibility tree for screen
  // readers. Assert on the box size directly rather than toBeVisible(),
  // which only checks for a non-empty box + visibility != hidden and
  // would report this element as "visible" either way.
  const hiddenBox = await skipLink.boundingBox()
  expect(hiddenBox?.width).toBeLessThanOrEqual(1)
  expect(hiddenBox?.height).toBeLessThanOrEqual(1)

  await page.keyboard.press("Tab")
  await expect(skipLink).toBeFocused()
  const focusedBox = await skipLink.boundingBox()
  expect(focusedBox?.width).toBeGreaterThan(10)

  await page.keyboard.press("Enter")
  await expect(course.withinContent()).toBeFocused()
}

test.describe("Course v3 skip to main content link", () => {
  test("is the first focusable element and moves focus to main content when activated", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    await assertSkipLinkWorks(page, course)
  })

  test("works on the course home page", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto()

    await assertSkipLinkWorks(page, course)
  })
})
