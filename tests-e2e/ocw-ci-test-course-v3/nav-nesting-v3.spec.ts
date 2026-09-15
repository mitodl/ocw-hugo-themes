import { test, expect, Locator, Page } from "@playwright/test"
import { CoursePage } from "../util"

/**
 * course-v3 counterpart of ocw-ci-test-course/nav-nesting.spec.ts, covering the
 * same regression: https://github.com/mitodl/hq/issues/13196.
 *
 * v3 renders the nav twice and tags each copy with its device, so these specs
 * scope to the desktop copy rather than relying on the mobile one being hidden.
 */

const desktopNav = (page: Page): Locator => page.locator(".course-nav.desktop")

const expandSection = async (page: Page, section: string) => {
  const toggle = desktopNav(page).getByRole("button", {
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
  const course = new CoursePage(page, "course-v3")
  await course.goto("", { waitUntil: "domcontentloaded" })

  await expandSection(page, "External Resources")

  const nav = desktopNav(page)
  await expect(nav.getByRole("link", { name: "Google.com" })).toBeVisible()
  await expect(
    nav.getByRole("link", { name: "OCW (no warning)" })
  ).toBeVisible()
})

test("Nested children of every content type link to their content", async ({
  page
}) => {
  const course = new CoursePage(page, "course-v3")
  await course.goto("", { waitUntil: "domcontentloaded" })

  await expandSection(page, "Nested Menu Demo")

  const expected: [string, RegExp][] = [
    ["Nested Page Child", /\/pages\/syllabus\/$/],
    ["Nested Video Gallery Child", /\/video_galleries\/lecture-videos\/$/],
    ["Resource List", /\/lists\/a-resource-list\/$/],
    ["Nested External Child", /^https:\/\/mit\.edu$/]
  ]

  for (const [name, href] of expected) {
    const link = desktopNav(page).getByRole("link", { name })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", href)
  }
})

test("Third-level nav item is reachable", async ({ page }) => {
  const course = new CoursePage(page, "course-v3")
  await course.goto("", { waitUntil: "domcontentloaded" })

  await expandSection(page, "Nested Menu Demo")
  await expandSection(page, "Nested External Child")

  const grandchild = desktopNav(page).getByRole("link", {
    name: "Nested External Grandchild"
  })
  await expect(grandchild).toBeVisible()
  await expect(grandchild).toHaveAttribute(
    "href",
    "https://ocw-studio-rc.odl.mit.edu/sites/ocw-ci-test-course"
  )
})
