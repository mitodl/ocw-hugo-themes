import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

const DESKTOP_COURSE_DRAWER_ID = "desktop-course-drawer"
const MAIN_COURSE_SECTION_ID = "main-course-section"

test("Course info section can be toggled", async ({ page, siteAlias }) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/pages/section-1")

  const heading = await page.getByRole("heading", { name: "Course Info" })
  const button = await page.getByRole("button", { name: "Course Info" })

  await expect(heading).toBeVisible()
  await button.click()
  await expect(heading).toBeHidden()
  await button.click()
  await expect(heading).toBeVisible()
})

test("Toggling topics does not affect drawer layout", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/pages/section-1")

  const heading = await page.getByRole("heading", { name: "Course Info" })
  const topicCollapseButton = await page.getByRole("button", {
    name: "Engineering subtopics"
  })

  await expect(heading).toBeVisible()
  await expect(topicCollapseButton).toHaveAttribute("aria-expanded", "true")

  await topicCollapseButton.click()
  const mainSection = await page.locator(`#${MAIN_COURSE_SECTION_ID}`)
  const drawer = await page.locator(`#${DESKTOP_COURSE_DRAWER_ID}`)

  await expect(mainSection).toHaveClass(/.*col-lg-9.*/)
  await expect(drawer).toHaveClass(/.*col-3.*/)
})

test("Mobile course info drawer lines up all of its sections", async ({
  page,
  siteAlias
}) => {
  await page.setViewportSize({ width: 375, height: 800 })
  const course = new CoursePage(page, siteAlias)
  await course.goto("/pages/section-1")
  await page.locator("#mobile-course-info-toggle").click()

  // Read every left edge in one frame, so the drawer's slide-in can't skew them.
  const lefts = await page.locator("#course-info-drawer").evaluate(drawer => {
    const shown = (element: Element) => element.getClientRects().length > 0
    const left = (element: Element | undefined) =>
      element ? element.getBoundingClientRect().left : null
    const heading = (name: string) =>
      Array.from(drawer.querySelectorAll("h3")).find(
        h3 => shown(h3) && h3.textContent?.trim() === name
      )
    return {
      instructors:           left(heading("Instructors")),
      departments:           left(heading("Departments")),
      level:                 left(heading("Level")),
      topics:                left(heading("Topics")),
      learningResourceTypes: left(heading("Learning Resource Types")),
      downloadButton:        left(
        Array.from(
          drawer.querySelectorAll("a.download-course-link-button")
        ).find(shown)
      )
    }
  })

  expect(lefts.instructors).not.toBeNull()
  for (const [section, left] of Object.entries(lefts)) {
    expect(left, section).toBe(lefts.instructors)
  }
})
