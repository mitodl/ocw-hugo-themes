import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

const DESKTOP_COURSE_DRAWER_ID = "desktop-course-drawer"
const DESKTOP_COURSE_DRAWER_COLUMN = "div.desktop-course-info"
const MAIN_COURSE_SECTION_ID = "course-content-section"

test.describe("Course v3 Course Info drawer focus management", () => {
  test("returns focus to the toggle button when closed", async ({
    page,
    siteAlias
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const course = new CoursePage(page, siteAlias)
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

  test("moves focus to the close button when opened", async ({
    page,
    siteAlias
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const course = new CoursePage(page, siteAlias)
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
    page,
    siteAlias
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const course = new CoursePage(page, siteAlias)
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

test.describe("Course v3 Course Info drawer", () => {
  test("close button id is not duplicated between the desktop and mobile drawers", async ({
    page,
    siteAlias
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const course = new CoursePage(page, siteAlias)
    await course.goto("/resources/file_pdf")

    // Regression test: course_info.html used to render the desktop close
    // button's id unconditionally whenever inPanel=true, so the mobile
    // drawer (mobile_course_info.html, also inPanel=true) rendered a
    // second element with the same id -- invalid HTML and an ambiguous
    // target for any id-based selector.
    await expect(
      page.locator("#desktop-course-drawer-button-close")
    ).toHaveCount(1)

    const mobileDrawer = page.locator("#course-info-drawer")
    await expect(
      mobileDrawer.locator("#desktop-course-drawer-button-close")
    ).toHaveCount(0)
  })
})

test("Course info section can be toggled (v3)", async ({ page, siteAlias }) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/pages/section-1")

  const heading = page.getByRole("heading", { name: "Course Info" })
  const button = page.getByRole("button", { name: "Course Info" })

  await expect(heading).toBeVisible()
  await button.click()
  await expect(heading).toBeHidden()
  await button.click()
  await expect(heading).toBeVisible()
})

test("Toggling topics does not affect drawer layout (v3)", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/pages/section-1")

  const heading = page.getByRole("heading", { name: "Course Info" })
  const topicCollapseButton = page.getByRole("button", {
    name: "Engineering subtopics"
  })

  await expect(heading).toBeVisible()
  await expect(topicCollapseButton).toHaveAttribute("aria-expanded", "true")

  await topicCollapseButton.click()
  const mainSection = page.locator(`#${MAIN_COURSE_SECTION_ID}`)
  const drawer = page.locator(`#${DESKTOP_COURSE_DRAWER_ID}`)
  const drawerColumn = page.locator(DESKTOP_COURSE_DRAWER_COLUMN)

  await expect(mainSection).toHaveClass(/.*course-detail.*/)
  await expect(drawer).toHaveClass(/.*collapse.*/)
  await expect(drawerColumn).toHaveClass(/.*col-lg-3.*/)
})
