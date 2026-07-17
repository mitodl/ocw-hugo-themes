import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 Course Info drawer", () => {
  test("close button id is not duplicated between the desktop and mobile drawers", async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    // Regression test: course_info.html used to render the desktop close
    // button's id unconditionally whenever inPanel=true, so the mobile
    // drawer (mobile_course_info.html, also inPanel=true) rendered a
    // second element with the same id -- invalid HTML and an ambiguous
    // target for any id-based selector.
    await expect(page.locator("#desktop-course-drawer-button-close")).toHaveCount(1)

    const mobileDrawer = page.locator("#course-info-drawer")
    await expect(
      mobileDrawer.locator("#desktop-course-drawer-button-close")
    ).toHaveCount(0)
  })
})
