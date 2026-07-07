import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course description", () => {
  test("clamps to a fixed number of lines with a working toggle", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    const description = page.locator("#course-description-text")
    const toggle = page.locator("#toggle-description")

    // Collapsed by default: clamped, overflowing, toggle visible.
    // The toggle must carry d-flex and not d-none: both are !important
    // Bootstrap display utilities and d-flex wins over d-none, so the JS
    // swaps them as a pair.
    await expect(description).toHaveCSS("-webkit-line-clamp", "5")
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveClass(/d-flex/)
    await expect(toggle).not.toHaveClass(/d-none/)
    await expect(toggle).toHaveText("Show more")
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(
      await description.evaluate(el => el.scrollHeight > el.clientHeight)
    ).toBe(true)

    // Expand
    await toggle.click()
    await expect(description).toHaveCSS("-webkit-line-clamp", "none")
    await expect(toggle).toHaveText("Show less")
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(
      await description.evaluate(el => el.scrollHeight > el.clientHeight)
    ).toBe(false)

    // Collapse again
    await toggle.click()
    await expect(description).toHaveCSS("-webkit-line-clamp", "5")
    await expect(toggle).toHaveText("Show more")
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
  })

  test("hides the toggle when the description does not overflow", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    const description = page.locator("#course-description-text")
    const toggle = page.locator("#toggle-description")
    await expect(toggle).toBeVisible()

    // Shrink the content in-page so the clamped element no longer overflows;
    // the ResizeObserver re-check must hide the toggle. Asserting rendered
    // visibility (not class state) guards against the Bootstrap 4 pitfall
    // where d-flex overrides d-none and the button stays visible.
    await description.evaluate(element => {
      element.textContent = "A short description."
    })
    await expect(toggle).toBeHidden()

    // Make it overflow again: the toggle must come back.
    await description.evaluate(element => {
      element.textContent = "More text than fits in five lines. ".repeat(50)
    })
    await expect(toggle).toBeVisible()
  })
})
