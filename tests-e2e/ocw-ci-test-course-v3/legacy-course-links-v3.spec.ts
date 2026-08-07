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

/**
 * What canonical_course_url.html produces for a link to this course. Kept as a
 * literal on purpose: that partial hardcodes the /courses/o/ prefix and passes
 * the authored slug straight through, so it never consults site.BaseURL.
 * Deriving this from TEST_SITES[...].basePath would make a prefix change (say
 * --base-url-prefix /courses/x) silently follow the harness instead of failing
 * here, which is where the hardcoding actually lives.
 */
const REWRITTEN_SELF = "/courses/o/ocw-ci-test-course"

/**
 * The site's real base path, for links Hugo builds from RelPermalink. Those do
 * track baseURL, so this one is derived.
 */
const SELF_PREFIX = `/${TEST_SITES["course-v3"].basePath}`

test.describe("Course v3 legacy /courses/ link rewriting", () => {
  test("Same-course link gains the /courses/o/ prefix", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Self link", exact: true })

    // The path is passed through as authored, so it keeps the missing trailing
    // slash and costs a 301 on click. Accepted.
    await expect(link).toHaveAttribute(
      "href",
      `${REWRITTEN_SELF}/pages/first-test-page-title`
    )
  })

  test("Same-course link is followable, not just rewritten", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    await page.getByRole("link", { name: "Self link", exact: true }).click()

    // Tolerant of the trailing slash: the rewritten href omits it, and the
    // server 301s to the slashed form. Landing on the page proves that works.
    await expect(page).toHaveURL(
      new RegExp(`${REWRITTEN_SELF}/pages/first-test-page-title/?$`)
    )
    await expect(page.locator("body")).toContainText(
      "This is the body of the first test page."
    )
  })

  test("Same-course link preserves its fragment", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Self link with anchor" })

    await expect(link).toHaveAttribute(
      "href",
      `${REWRITTEN_SELF}/pages/first-test-page-title#a-section`
    )
  })

  test("Link to a nonexistent page is rewritten without validation", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Self link to missing page" })

    // Documentation, not coverage: with the site.GetPage lookup gone there is no
    // code path that distinguishes an existing page from a missing one, so this
    // shares its path with the self-link test above. It exists to record the
    // accepted cost — the target does not exist, the build says nothing, and
    // nothing else in the pipeline catches dead internal links.
    await expect(link).toHaveAttribute(
      "href",
      `${REWRITTEN_SELF}/pages/deliberately-missing-page#a-section`
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
      "/courses/o/some-other-course-fall-2020/pages/syllabus"
    )
    await expect(link).not.toHaveAttribute("target", "_blank")
  })

  test("Cross-course link with no sub-path is rewritten", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Cross course bare link" })

    await expect(link).toHaveAttribute(
      "href",
      "/courses/o/some-other-course-fall-2020"
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

  test("An already-correct link is not rewritten a second time", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(PAGE)

    const link = page.getByRole("link", { name: "Own base path link" })

    // Idempotency: this is the shape resource_link shortcodes emit back into the
    // same hook, so it must survive untouched.
    //
    // Note this does not isolate get_destination.html's $basePath guard. While
    // the prefix is /courses/o, that guard and canonical_course_url.html's
    // /courses/o/ check each produce this result independently — neutralizing
    // either one alone still passes. The $basePath guard only becomes load-
    // bearing under a different prefix (--base-url-prefix /courses/x, say),
    // where the normalizer would otherwise rewrite a correct self-link.
    await expect(link).toHaveAttribute(
      "href",
      `${REWRITTEN_SELF}/pages/second-test-page`
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
