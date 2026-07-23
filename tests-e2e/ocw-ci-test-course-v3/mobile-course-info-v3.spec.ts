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
    // 844px viewport minus the 60px mobile header height the drawer now
    // starts below (calc(100% - $mit-learn-header-height-mobile)).
    await expect(drawer).toHaveCSS("height", "784px")
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

  test("Drawer starts below the MIT Learn header instead of overlaying it, matching the Explore MIT nav drawer", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    await toggle.click()

    const drawer = page.locator("#course-info-drawer")
    const header = page.locator("#mit-learn-header")

    const headerBox = await header.boundingBox()
    const drawerBox = await drawer.boundingBox()

    expect(headerBox).not.toBeNull()
    expect(drawerBox).not.toBeNull()
    // The drawer's top edge should sit exactly at the header's bottom edge,
    // not underneath/behind it (which would need a higher z-index to
    // render on top instead).
    expect(Math.abs(drawerBox.y - (headerBox.y + headerBox.height))).toBeLessThan(1)
  })

  test("Drawer background matches the Explore MIT nav drawer's background", async ({
    page
  }) => {
    // Both drawers, and the page itself, should read as the same shade of
    // white. Regression guard for the `bg-light`/`bg-faded` Bootstrap
    // classes (which carried an `!important` background-color that beat the
    // drawer's own un-`!important` `background: white` rule) having been
    // removed from #course-info-drawer's markup.
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    await toggle.click()

    const infoDrawer = page.locator("#course-info-drawer")
    await expect(infoDrawer).toHaveClass(/\bin\b/)
    await expect(infoDrawer).toHaveCSS("background-color", "rgb(255, 255, 255)")

    const closeButton = page.locator("#close-mobile-course-info-button")
    await closeButton.click()

    // Not .first(): at this 390px viewport only the mobile menu button is
    // actually visible (the desktop one is display:none), and .first()
    // isn't guaranteed to pick the visible one.
    const menuButton = page.locator("#mit-learn-menu-button-mobile")
    await menuButton.click()

    const exploreDrawer = page.locator("#mit-learn-nav-drawer")
    await expect(exploreDrawer).toHaveClass(/open/)
    await expect(exploreDrawer).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)"
    )
  })
})

test.describe("Course Info / Explore MIT drawer mutual exclusion", () => {
  // The two drawers are driven by completely independent systems (offcanvas-
  // bootstrap for #course-info-drawer, mit_learn_header.ts's own custom
  // open/close logic for #mit-learn-nav-drawer). Only one should ever be
  // open at a time, regardless of which one was opened first.
  test("Opening Explore MIT after Course Info closes Course Info and opens Explore MIT", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const infoToggle = page.locator("#mobile-course-info-toggle")
    const infoDrawer = page.locator("#course-info-drawer")
    const exploreButton = page.locator("#mit-learn-menu-button-mobile")
    const exploreDrawer = page.locator("#mit-learn-nav-drawer")

    await infoToggle.click()
    await expect(infoDrawer).toHaveClass(/\bin\b/)

    await exploreButton.click()

    await expect(exploreDrawer).toHaveClass(/open/)
    await expect(infoDrawer).not.toHaveClass(/\bin\b/)
  })

  test("Opening Course Info after Explore MIT closes Explore MIT and opens Course Info", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const infoToggle = page.locator("#mobile-course-info-toggle")
    const infoDrawer = page.locator("#course-info-drawer")
    const exploreButton = page.locator("#mit-learn-menu-button-mobile")
    const exploreDrawer = page.locator("#mit-learn-nav-drawer")

    await exploreButton.click()
    await expect(exploreDrawer).toHaveClass(/open/)

    // Explore's full-viewport backdrop visually sits on top of the Info
    // toggle at this point, so a real tap at the toggle's screen position
    // actually lands on the backdrop, not the button - `force: true` still
    // dispatches a real, coordinate-based click that the browser routes via
    // its own hit-testing (unlike a plain JS `.click()`), so this reproduces
    // exactly what a real user's tap does here.
    await infoToggle.click({ force: true })

    await expect(infoDrawer).toHaveClass(/\bin\b/)
    await expect(exploreDrawer).not.toHaveClass(/open/)
  })

  test("Opening Course Info alone does not disturb Explore MIT's own closed state", async ({
    page
  }) => {
    // Regression guard: the mutual-exclusion coordination should be a
    // no-op when the other drawer was never open, not just correct when it
    // was.
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const infoToggle = page.locator("#mobile-course-info-toggle")
    const infoDrawer = page.locator("#course-info-drawer")
    const exploreButton = page.locator("#mit-learn-menu-button-mobile")
    const exploreDrawer = page.locator("#mit-learn-nav-drawer")

    await infoToggle.click()
    await expect(infoDrawer).toHaveClass(/\bin\b/)

    await expect(exploreDrawer).not.toHaveClass(/open/)
    await expect(exploreDrawer).toHaveAttribute("inert", "")
    await expect(exploreButton).toHaveAttribute("aria-expanded", "false")
  })

  test("Opening Explore MIT alone does not disturb Course Info's own closed state", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const infoDrawer = page.locator("#course-info-drawer")
    const exploreButton = page.locator("#mit-learn-menu-button-mobile")
    const exploreDrawer = page.locator("#mit-learn-nav-drawer")

    await exploreButton.click()
    await expect(exploreDrawer).toHaveClass(/open/)

    await expect(infoDrawer).not.toHaveClass(/\bin\b/)
  })

  test("Each drawer still opens and closes normally on its own after the coordination module loads", async ({
    page
  }) => {
    // Regression guard: adding cross-drawer coordination must not break the
    // baseline single-drawer open/close behavior.
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const infoToggle = page.locator("#mobile-course-info-toggle")
    const infoDrawer = page.locator("#course-info-drawer")

    await infoToggle.click()
    await expect(infoDrawer).toHaveClass(/\bin\b/)
    await infoToggle.click()
    await expect(infoDrawer).not.toHaveClass(/\bin\b/)

    const exploreButton = page.locator("#mit-learn-menu-button-mobile")
    const exploreDrawer = page.locator("#mit-learn-nav-drawer")

    await exploreButton.click()
    await expect(exploreDrawer).toHaveClass(/open/)
    // Not re-clicking exploreButton: Explore's own full-viewport backdrop
    // covers its trigger button once open (pre-existing mit_learn_header.ts
    // behavior, unrelated to this branch - no existing test in this
    // codebase closes Explore this way either, only via its close button or
    // the backdrop itself), so close it the same way the rest of the suite
    // does.
    await page.locator("#mit-learn-nav-close").click()
    await expect(exploreDrawer).not.toHaveClass(/open/)
  })
})
