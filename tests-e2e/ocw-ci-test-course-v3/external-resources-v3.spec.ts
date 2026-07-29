import { test, expect } from "@playwright/test"
import { CoursePage, V3_CANONICAL_DOMAIN } from "../util"

/**
 * External resources whose external_url points at an OCW course are rewritten
 * onto the canonical domain under /courses/o/, via the get_external_url.html
 * seam that course-v3 overrides. Everything else must pass through, and an
 * OCW link must not start behaving like a third-party link just because its
 * host changed.
 */
const CANONICAL = `https://${V3_CANONICAL_DOMAIN}`
const REWRITTEN = `${CANONICAL}/courses/o/some-other-course-fall-2020/pages/syllabus/`

test.describe("Course v3 external resource link rewriting", () => {
  test("External resource page rewrites an OCW course URL", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/external-resources/ocw-course-link")

    const link = page.getByRole("link", { name: "OCW course link" })

    await expect(link).toHaveAttribute("href", REWRITTEN)
  })

  test("Rewritten OCW course URL keeps internal-link treatment", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/external-resources/ocw-course-link")

    const link = page.getByRole("link", { name: "OCW course link" })

    // The canonical domain need not contain "ocw.mit.edu", so the
    // is-this-an-OCW-link check reads the authored URL. If it read the
    // rewritten one, this link would gain a leaving-OCW warning and open in a
    // new tab.
    await expect(link).not.toHaveAttribute("target", "_blank")
    await expect(link).not.toHaveClass(/external-link/)
  })

  test("Rewritten OCW course URL stays warning-free even when the resource asks for a warning", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/external-resources/ocw-course-link-warned")

    const link = page.getByRole("link", { name: "OCW course link warned" })

    // has_external_license_warning is true on this fixture, but the OCW branch
    // of external_resource_link ignores it. external_link_modal.ts binds to
    // a.external-link-warning, so this class is what decides whether clicking
    // pops the leaving-OCW dialog.
    await expect(link).toHaveAttribute(
      "href",
      `${CANONICAL}/courses/o/another-course-spring-2021/pages/readings/`
    )
    await expect(link).not.toHaveClass(/external-link-warning/)

    await link.click()

    await expect(
      page.getByRole("heading", {
        name: "You are leaving MIT OpenCourseWare"
      })
    ).toBeHidden()
  })

  test("resource_link to an external resource is rewritten too", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/legacy-course-links")

    // Reaches external_resource_link via resource_link.html, a different call
    // path than external-resources/single.html above.
    const link = page.getByRole("link", { name: "OCW course link" })

    await expect(link).toHaveAttribute("href", REWRITTEN)
  })

  test("An ocw.mit.edu URL that is not a course path is untouched", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/external-resources-page")

    const link = page.getByRole("link", { name: "OCW main" })

    await expect(link).toHaveAttribute("href", "https://ocw.mit.edu")
    await expect(link).not.toHaveAttribute("target", "_blank")
  })

  test("Genuinely external links still get the warning treatment", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/external-resources-page")

    const link = page.getByRole("link", { name: "Google.com" }).first()

    await expect(link).toHaveAttribute("href", "https://google.com")
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveClass(/external-link-warning/)
  })
})
