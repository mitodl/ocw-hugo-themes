import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Mobile Course Info drawer", () => {
  test("Toggle button is absent on the home page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    await expect(page.locator("#mobile-course-info-toggle")).toHaveCount(0)
  })

  test("Toggle button opens the drawer on mobile viewports", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    const drawer = page.locator("#course-info-drawer")

    await expect(toggle).toBeVisible()
    await expect(drawer).not.toHaveClass(/\bin\b/)

    await toggle.click()

    await expect(drawer).toHaveClass(/\bin\b/)
    await expect(
      drawer.getByRole("heading", { name: "Course Info" })
    ).toBeVisible()
  })

  test("Close button closes the drawer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    const drawer = page.locator("#course-info-drawer")

    await toggle.click()
    await expect(drawer).toHaveClass(/\bin\b/)

    const closeButton = page.locator("#close-mobile-course-info-button")
    await closeButton.click()

    await expect(drawer).not.toHaveClass(/\bin\b/)
  })

  test("Toggle button is hidden on desktop viewports", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    await expect(toggle).toBeHidden()
  })

  test("Download button is removed from the mobile drawer but stays elsewhere on the page", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    // Bottom-of-page button + desktop drawer's own copy, both untouched by this task.
    await expect(page.locator(".download-course-button-v3")).toHaveCount(2)

    const toggle = page.locator("#mobile-course-info-toggle")
    await toggle.click()

    const drawer = page.locator("#course-info-drawer")
    await expect(drawer).toHaveClass(/\bin\b/)
    await expect(drawer.locator(".download-course-button-v3")).toHaveCount(0)
    await expect(page.locator(".download-course-button-v3")).toHaveCount(2)
  })

  test("Course Info subsection headings use the homepage type scale inside the mobile drawer", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    await toggle.click()

    const heading = page
      .locator("#course-info-drawer .course-subsection-heading")
      .first()
    await expect(heading).toBeVisible()
    await expect(heading).toHaveCSS("font-size", "14px")
    await expect(heading).toHaveCSS("font-weight", "500")
  })

  test("Mobile drawer body text is 12px, distinct from the 18px/14px headings above it", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    await toggle.click()

    const drawer = page.locator("#course-info-drawer")
    await expect(drawer.locator(".course-section-heading").first()).toHaveCSS(
      "font-size",
      "18px"
    )
    await expect(
      drawer.locator(".course-subsection-heading").first()
    ).toHaveCSS("font-size", "14px")
    await expect(drawer.locator(".panel-course-info-text").first()).toHaveCSS(
      "font-size",
      "12px"
    )
    await expect(
      drawer.locator(".learning-resource-type-item span").last()
    ).toHaveCSS("font-size", "12px")
  })

  test("Course Info drawer has consistent padding and inter-section spacing", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    await toggle.click()

    // Vertical matches the desktop drawer's own padding (Bootstrap's .p-4).
    // Horizontal matches .mit-learn-nav-section's left/right padding (the
    // Explore MIT nav drawer), so the two drawers read as the same
    // component's content inset, not a narrower mobile knockoff.
    const drawer = page.locator("#course-info-drawer")
    await expect(drawer).toHaveCSS("padding-top", "24px")
    await expect(drawer).toHaveCSS("padding-right", "32px")
    await expect(drawer).toHaveCSS("padding-bottom", "24px")
    await expect(drawer).toHaveCSS("padding-left", "32px")

    // The close-button row (position: absolute, so it collapses to ~0
    // height) shouldn't add its own gap before Course Info. Topics is
    // targeted by class rather than position: course_info.html ends with
    // an inline <script> tag that becomes a direct-child sibling once
    // inlined here, shifting positional indices.
    const courseInfoSection = drawer.locator("> .course-info")
    const topicsSection = drawer.locator("> .course-topics-container")
    await expect(courseInfoSection).toBeVisible()
    await expect(courseInfoSection).toHaveCSS("margin-top", "0px")
    await expect(topicsSection).toBeVisible()
    await expect(topicsSection).toHaveCSS("margin-top", "24px")
  })

  test("Drawer height stays viewport-sized even if something sets an inline height", async ({
    page
  }) => {
    // offcanvas-bootstrap's Offcanvas._navbarHeight() sets an inline height
    // via jQuery ($(window).outerHeight()) on every open. Under Chrome's
    // device toolbar specifically, that call reports the real desktop
    // window's height rather than the emulated viewport's, inflating the
    // drawer's height so its own content stops overflowing it, so it can't
    // scroll. Reproduce the inline-height side of that bug directly (rather
    // than the outerHeight() misreport itself, which this harness can't
    // control) and assert our external !important rule still wins.
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    await toggle.click()

    const drawer = page.locator("#course-info-drawer")
    await drawer.evaluate(el => {
      el.style.height = "2000px"
    })
    await expect(drawer).toHaveCSS("height", "844px")
  })

  test("Drawer shell matches the Explore MIT nav drawer's shadow, width, and close icon", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    await toggle.click()

    const drawer = page.locator("#course-info-drawer")
    await expect(drawer).toHaveCSS(
      "box-shadow",
      "rgba(37, 38, 43, 0.1) 0px 6px 24px 0px"
    )
    await expect(drawer).toHaveCSS("max-width", "320px")

    const closeIcon = page.locator("#close-mobile-course-info-button svg")
    await expect(closeIcon).toBeVisible()
    await expect(closeIcon).toHaveCSS("width", "18px")
    await expect(closeIcon).toHaveCSS("height", "18px")
  })
})
