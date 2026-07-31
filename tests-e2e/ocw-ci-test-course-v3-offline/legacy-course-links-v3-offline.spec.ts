import { test, expect } from "@playwright/test"
import { offlineFileUrl, V3_CANONICAL_DOMAIN } from "../util"

/**
 * Offline builds set relativeURLs: true, so Hugo rewrites any root-relative URL
 * in the output into a path relative to the current page. That keeps in-package
 * links working over file://, but it means a root-relative URL meant for the
 * live site turns into a dead path inside the extracted package.
 *
 * Links that leave the package therefore have to be fully qualified before Hugo
 * sees them — see course-offline-v3/layouts/partials/absolutize_course_url.html.
 * These are deliberately NOT checked with expectLocalPackageHref.
 *
 * Fixture: test-sites/ocw-ci-test-course/content/pages/legacy-course-links.md
 */
const PAGE = "/pages/legacy-course-links"
const CANONICAL = `https://${V3_CANONICAL_DOMAIN}`

test.describe("offline-v3 legacy /courses/ link rewriting", () => {
  test("same-course link is prefixed and fully qualified", async ({ page }) => {
    await page.goto(offlineFileUrl(PAGE))

    const link = page.getByRole("link", { name: "Self link", exact: true })

    await expect(link).toHaveAttribute(
      "href",
      `${CANONICAL}/courses/o/ocw-ci-test-course/pages/first-test-page-title`
    )
  })

  test("same-course link keeps its fragment", async ({ page }) => {
    await page.goto(offlineFileUrl(PAGE))

    const link = page.getByRole("link", { name: "Self link with anchor" })

    await expect(link).toHaveAttribute(
      "href",
      `${CANONICAL}/courses/o/ocw-ci-test-course/pages/first-test-page-title#a-section`
    )
  })

  test("cross-course link is prefixed and fully qualified", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(PAGE))

    const link = page.getByRole("link", { name: "Cross course link" })

    await expect(link).toHaveAttribute(
      "href",
      `${CANONICAL}/courses/o/some-other-course-fall-2020/pages/syllabus`
    )
  })

  test("cross-course link with no sub-path is prefixed and fully qualified", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(PAGE))

    const link = page.getByRole("link", { name: "Cross course bare link" })

    await expect(link).toHaveAttribute(
      "href",
      `${CANONICAL}/courses/o/some-other-course-fall-2020`
    )
  })

  test("link already under /courses/o/ gains a host but keeps its path", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(PAGE))

    const link = page.getByRole("link", { name: "Own base path link" })

    // canonical_course_url leaves an already-prefixed path alone, so no second
    // prefix and no trailing slash is added — only the host.
    await expect(link).toHaveAttribute(
      "href",
      `${CANONICAL}/courses/o/ocw-ci-test-course/pages/second-test-page`
    )
  })

  test("non-course ocw.mit.edu links are untouched", async ({ page }) => {
    await page.goto(offlineFileUrl(PAGE))

    await expect(
      page.getByRole("link", { name: "OCW terms link" })
    ).toHaveAttribute("href", "https://ocw.mit.edu/terms")

    await expect(
      page.getByRole("link", { name: "OCW courses listing link" })
    ).toHaveAttribute("href", "https://ocw.mit.edu/courses/")
  })

  test("a /courses/ path on a non-OCW host is untouched", async ({ page }) => {
    await page.goto(offlineFileUrl(PAGE))

    await expect(
      page.getByRole("link", { name: "Third party courses link" })
    ).toHaveAttribute(
      "href",
      "https://example.com/courses/not-ours/pages/syllabus"
    )
  })

  test("no link on the page is left root-relative", async ({ page }) => {
    await page.goto(offlineFileUrl(PAGE))

    // The regression guard: a root-relative href here would be rewritten by
    // relativeURLs into a path that dead-ends inside the package.
    const rootRelative = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map(a => a.getAttribute("href") ?? "")
        .filter(href => href.startsWith("/"))
    )

    expect(rootRelative).toEqual([])
  })
})

test.describe("offline-v3 external resources pointing at courses", () => {
  test("external resource page link is prefixed and fully qualified", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/external-resources/ocw-course-link"))

    const link = page.getByRole("link", {
      name:  "OCW course link",
      exact: true
    })

    await expect(link).toHaveAttribute(
      "href",
      `${CANONICAL}/courses/o/some-other-course-fall-2020/pages/syllabus/`
    )
  })

  test("resource_link to an external resource is rewritten too", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(PAGE))

    // Reaches external_resource_link through resource_link.html — a different
    // call path than external-resources/single.html above.
    const link = page.getByRole("link", {
      name:  "OCW course link",
      exact: true
    })

    await expect(link).toHaveAttribute(
      "href",
      `${CANONICAL}/courses/o/some-other-course-fall-2020/pages/syllabus/`
    )
  })
})
