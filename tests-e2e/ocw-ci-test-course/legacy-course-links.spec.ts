import { test, expect } from "../util/fixtures"
import { CoursePage, FIXTURES_PORT } from "../util"

/**
 * The /courses/ rewriting is course-v3 only. v2 is served at /courses/<slug>/,
 * so these links are already correct there and must be left exactly as
 * authored. base-theme's get_destination.html and get_external_url.html are
 * both passthroughs; these tests guard against the v3 behaviour leaking into
 * base-theme, where it would also reach www.
 *
 * COURSE_V3_CANONICAL_DOMAIN is not allowlisted in security.funcs.getenv for
 * the v2 or www configs, so a leak would break those builds outright.
 */
const PAGE = "/pages/legacy-course-links"
const STATIC_API_ORIGIN = `http://localhost:${FIXTURES_PORT}`

test.describe("Course v2 leaves legacy /courses/ links alone", () => {
  test("Same-course link is unchanged", async ({ page, siteAlias }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto(PAGE)

    const expectedHref =
      siteAlias === "course-offline" ?
        `${STATIC_API_ORIGIN}/courses/ocw-ci-test-course/pages/first-test-page-title` :
        "/courses/ocw-ci-test-course/pages/first-test-page-title"
    await expect(
      page.getByRole("link", { name: "Self link", exact: true })
    ).toHaveAttribute("href", expectedHref)
  })

  test("Same-course link with a fragment is unchanged", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto(PAGE)

    const expectedHref =
      siteAlias === "course-offline" ?
        `${STATIC_API_ORIGIN}/courses/ocw-ci-test-course/pages/first-test-page-title#a-section` :
        "/courses/ocw-ci-test-course/pages/first-test-page-title#a-section"
    await expect(
      page.getByRole("link", { name: "Self link with anchor" })
    ).toHaveAttribute("href", expectedHref)
  })

  test("Cross-course link is unchanged", async ({ page, siteAlias }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto(PAGE)

    const expectedHref =
      siteAlias === "course-offline" ?
        `${STATIC_API_ORIGIN}/courses/some-other-course-fall-2020/pages/syllabus` :
        "/courses/some-other-course-fall-2020/pages/syllabus"
    await expect(
      page.getByRole("link", { name: "Cross course link" })
    ).toHaveAttribute("href", expectedHref)
  })

  test("External resource pointing at a course is unchanged", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/external-resources/ocw-course-link")

    const link = page.getByRole("link", { name: "OCW course link" })

    await expect(link).toHaveAttribute(
      "href",
      "https://ocw.mit.edu/courses/some-other-course-fall-2020/pages/syllabus/"
    )
    await expect(link).not.toHaveAttribute("target", "_blank")
  })

  test("A /courses/o/ link is left alone rather than rewritten back", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto(PAGE)

    const expectedHref =
      siteAlias === "course-offline" ?
        `${STATIC_API_ORIGIN}/courses/o/ocw-ci-test-course/pages/second-test-page` :
        "/courses/o/ocw-ci-test-course/pages/second-test-page"
    await expect(
      page.getByRole("link", { name: "Own base path link" })
    ).toHaveAttribute("href", expectedHref)
  })

  test("External resource requesting a warning still gets none, and keeps its URL", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/external-resources/ocw-course-link-warned")

    const link = page.getByRole("link", { name: "OCW course link warned" })

    await expect(link).toHaveAttribute(
      "href",
      "https://ocw.mit.edu/courses/another-course-spring-2021/pages/readings/"
    )
    await expect(link).not.toHaveClass(/external-link-warning/)
  })
})
