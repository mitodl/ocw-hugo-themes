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
    await expect(
      page.locator("#desktop-course-drawer-button-close")
    ).toHaveCount(1)

    const mobileDrawer = page.locator("#course-info-drawer")
    await expect(
      mobileDrawer.locator("#desktop-course-drawer-button-close")
    ).toHaveCount(0)
  })
})

test.describe("Course v3 Topics", () => {
  /**
   * The Topics section is driven by the curated `mit_learn_topics` key in
   * data/course.json, not the legacy `topics` key -- see
   * course-v3/layouts/partials/topics.html. `mit_learn_topics` is at most two
   * levels deep (topic -> subtopic), so topic.html renders no third tier.
   *
   */
  const gotoWithDrawer = async (page: import("@playwright/test").Page) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")
    return page.locator("#desktop-course-drawer .course-topics-container")
  }

  test("renders mit_learn_topics rather than the legacy topics key", async ({
    page
  }) => {
    const topics = await gotoWithDrawer(page)

    await expect(
      topics.getByRole("link", { name: "Art, Design & Architecture" })
    ).toBeVisible()
    await expect(
      topics.getByRole("link", { name: "Business & Management" })
    ).toBeVisible()

    // Filter on the link text rather than the ARIA role: topic.html only adds
    // Bootstrap's `show` class to the first topic's subtopic list, and
    // "Business & Management" sorts second, so its subtopic starts collapsed
    // and is absent from the accessibility tree. The same locator is what
    // catches a legacy `topics` value that renders but is collapsed.
    const topicLinks = topics.locator("a.course-info-topic")
    await expect(
      topicLinks.filter({ hasText: "Business Analytics" })
    ).toHaveCount(1)

    // Values that exist only under the legacy `topics` key.
    await expect(topicLinks.filter({ hasText: "Engineering" })).toHaveCount(0)
    await expect(topicLinks.filter({ hasText: "Science" })).toHaveCount(0)
  })

  test("only the two-level topic gets a collapse toggle", async ({ page }) => {
    const topics = await gotoWithDrawer(page)

    // "Art, Design & Architecture" is a one-element path, so it has no
    // subtopics and therefore no chevron.
    await expect(
      topics.getByRole("button", {
        name: "Art, Design & Architecture subtopics"
      })
    ).toHaveCount(0)

    // "Business & Management" is a two-element path, so it gets a chevron.
    // It sorts second, so it starts collapsed.
    const toggle = topics.getByRole("button", {
      name: "Business & Management subtopics"
    })
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute("aria-expanded", "false")

    const subtopic = topics.getByRole("link", { name: "Business Analytics" })
    await expect(subtopic).toBeHidden()

    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    await expect(subtopic).toBeVisible()
  })

  test("topic links use the topic search param, not the legacy t", async ({
    page
  }) => {
    const topics = await gotoWithDrawer(page)

    const hrefs = await topics
      .locator("a.course-info-topic")
      .evaluateAll(links => links.map(link => link.getAttribute("href") ?? ""))

    expect(hrefs.length).toBe(3)
    for (const href of hrefs) {
      expect(new URL(href, "http://localhost").searchParams.has("topic")).toBe(
        true
      )
      expect(new URL(href, "http://localhost").searchParams.has("t")).toBe(
        false
      )
    }
  })
})
