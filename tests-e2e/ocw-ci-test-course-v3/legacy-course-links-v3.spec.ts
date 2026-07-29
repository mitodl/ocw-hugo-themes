import { test, expect } from "@playwright/test"
import { CoursePage, TEST_SITES } from "../util"

/**
 * course-v3 sites are served under a path prefix, but a lot of authored
 * markdown contains site-absolute /courses/<slug>/... links written when
 * courses were served at /courses/<slug>/. course-v3's get_destination.html
 * render hook rewrites those.
 *
 * The rewrite is pure path surgery — it does not resolve links against Hugo's
 * page tree — so a self-link and a cross-course link are handled identically.
 * That works because ocw-studio derives the v3 baseURL from the same url_path
 * that populates site_url_path, so the served slug matches the authored one.
 */
const PAGE = "/pages/legacy-course-links"
const SELF_PREFIX = `/${TEST_SITES["course-v3"].basePath}`

test.describe("Course v3 legacy /courses/ link rewriting", () => {
  test("Same-course link resolves against this site's baseURL", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Self link", exact: true })

    // canonical_course_url adds Hugo's canonical trailing slash, so this does
    // not cost a redirect and matches what resource_link shortcodes emit.
    await expect(link).toHaveAttribute(
      "href",
      `${SELF_PREFIX}/pages/first-test-page-title/`
    )
  })

  test("Same-course link is followable, not just rewritten", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    await page.getByRole("link", { name: "Self link", exact: true }).click()

    await expect(page).toHaveURL(
      new RegExp(`${SELF_PREFIX}/pages/first-test-page-title/?$`)
    )
    await expect(page.locator("body")).toContainText(
      "This is the body of the first test page."
    )
  })

  test("Same-course link keeps its fragment exactly once", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Self link with anchor" })

    await expect(link).toHaveAttribute(
      "href",
      `${SELF_PREFIX}/pages/first-test-page-title/#a-section`
    )
  })

  test("Link to a nonexistent page is rewritten without validation", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Self link to missing page" })

    // Documents an accepted cost of dropping the site.GetPage lookup: this page
    // does not exist, and the build says nothing about it. Nothing else in the
    // pipeline catches dead internal links.
    await expect(link).toHaveAttribute(
      "href",
      `${SELF_PREFIX}/pages/deliberately-missing-page/#a-section`
    )
  })

  test("Cross-course link gains the /courses/o/ prefix and stays root-relative", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Cross course link" })

    // Authored root-relative, so it stays root-relative and resolves against
    // whichever host serves this build. Keeping it relative also preserves v2's
    // same-tab behaviour: render-link.html adds target="_blank" to any
    // destination starting with "http".
    await expect(link).toHaveAttribute(
      "href",
      "/courses/o/some-other-course-fall-2020/pages/syllabus/"
    )
    await expect(link).not.toHaveAttribute("target", "_blank")
  })

  test("Cross-course link with no sub-path is rewritten", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Cross course bare link" })

    await expect(link).toHaveAttribute(
      "href",
      "/courses/o/some-other-course-fall-2020/"
    )
  })

  test("Another course already under /courses/o/ is left alone", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Already prefixed link" })

    // Covers canonical_course_url.html's /courses/o/ guard: the slug here is
    // "o", so this reaches the cross-course branch and must not gain a second
    // prefix.
    await expect(link).toHaveAttribute(
      "href",
      "/courses/o/some-other-course-fall-2020/pages/syllabus"
    )
  })

  test("Link already at this site's base path is left alone", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Own base path link" })

    // A link that is already correct must survive untouched — this is the shape
    // resource_link shortcodes emit back into this same hook.
    //
    // Two guards independently produce this result while the prefix is
    // /courses/o: get_destination.html's $basePath check, and
    // canonical_course_url.html's /courses/o/ check. Neutralizing either one
    // alone still passes. The $basePath guard is the one that matters for a
    // different prefix (--base-url-prefix /courses/x, say), where the
    // normalizer would otherwise rewrite a correct self-link.
    await expect(link).toHaveAttribute(
      "href",
      `${SELF_PREFIX}/pages/second-test-page`
    )
  })

  test("Non-course ocw.mit.edu links are untouched", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    // Pages like /terms live on www, not on the course-v3 canonical domain.
    await expect(
      page.getByRole("link", { name: "OCW terms link" })
    ).toHaveAttribute("href", "https://ocw.mit.edu/terms")

    // /courses/ is the listing page, not a course.
    await expect(
      page.getByRole("link", { name: "OCW courses listing link" })
    ).toHaveAttribute("href", "https://ocw.mit.edu/courses/")
  })

  test("A /courses/ path on a non-OCW host is untouched", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Third party courses link" })

    await expect(link).toHaveAttribute(
      "href",
      "https://example.com/courses/not-ours/pages/syllabus"
    )
  })

  test("Shortcode-generated resource links keep working alongside the rewrite", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/shortcode-demos")

    const link = page.getByRole("link", {
      name: "Resource link to First Test Page"
    })

    await expect(link).toHaveAttribute(
      "href",
      `${SELF_PREFIX}/pages/first-test-page-title/`
    )
  })
})
