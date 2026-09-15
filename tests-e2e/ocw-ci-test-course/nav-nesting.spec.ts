import { test, expect, Page } from "@playwright/test"
import { CoursePage } from "../util"

/**
 * Regression coverage for https://github.com/mitodl/hq/issues/13196.
 *
 * ocw-studio publishes external resources with `render: false`, so Hugo builds
 * no page for them and their leftnav entries arrive with an empty `.URL`. The
 * nav used to decide whether to draw a section's expand toggle from that `.URL`
 * alone, so a section whose children were all external resources got no toggle
 * and its children stayed sealed inside a permanently collapsed <ul>.
 *
 * The hidden mobile nav renders the same markup, but hidden elements are absent
 * from the accessibility tree, so the role-based locators below resolve to the
 * desktop nav on their own.
 */

const expandSection = async (page: Page, section: string) => {
  const toggle = page.getByRole("button", {
    name: `Subsections for ${section}`
  })
  await expect(toggle).toBeVisible()
  await toggle.click()

  /**
   * Bootstrap marks a collapse `collapsing` while it animates and only swaps in
   * `show` once it settles. Clicking a nested toggle before the outer animation
   * finishes makes Bootstrap measure a zero scrollHeight, and that click is
   * silently swallowed, so wait the transition out before returning.
   */
  const list = page.locator(`#${await toggle.getAttribute("aria-controls")}`)
  await expect(list).toHaveClass(/\bshow\b/)
  await expect(list).not.toHaveClass(/\bcollapsing\b/)
}

test("Section whose children are all external resources can be expanded", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("", { waitUntil: "domcontentloaded" })

  await expandSection(page, "External Resources")

  await expect(page.getByRole("link", { name: "Google.com" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "OCW (no warning)" })
  ).toBeVisible()
})

test("Nested children of every content type link to their content", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("", { waitUntil: "domcontentloaded" })

  await expandSection(page, "Nested Menu Demo")

  const expected: [string, RegExp][] = [
    ["Nested Page Child", /\/pages\/syllabus\/$/],
    ["Nested Video Gallery Child", /\/video_galleries\/lecture-videos\/$/],
    ["Resource List", /\/lists\/a-resource-list\/$/],
    ["Nested External Child", /^https:\/\/mit\.edu$/]
  ]

  for (const [name, href] of expected) {
    const link = page.getByRole("link", { name })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", href)
  }
})

test("Third-level nav item is reachable", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("", { waitUntil: "domcontentloaded" })

  await expandSection(page, "Nested Menu Demo")
  await expandSection(page, "Nested External Child")

  const grandchild = page.getByRole("link", {
    name: "Nested External Grandchild"
  })
  await expect(grandchild).toBeVisible()
  await expect(grandchild).toHaveAttribute(
    "href",
    "https://ocw-studio-rc.odl.mit.edu/sites/ocw-ci-test-course"
  )
})
