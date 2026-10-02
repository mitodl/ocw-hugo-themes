import { test, expect, Page } from "@playwright/test"
import { offlineV3FileUrl, expectLocalPackageHref } from "../util"

/**
 * file://-only: an in-package link has to keep its #fragment and ?query at the
 * very end, after the explicit index.html that makes a page path resolve from
 * disk. A server hides a mistake here by serving a directory's index.html on
 * its own, so only file:// shows what a downloaded course actually does.
 *
 * Fixtures:
 *   test-sites/ocw-ci-test-course/content/pages/fragment-links.md
 *   test-sites/ocw-ci-test-course/content/pages/fragment-link-target.md
 */
const SOURCE = "/pages/fragment-links"

const ANCHORED_LINKS = [
  ["resource_link with an anchor", "Anchored resource link"],
  ["root-relative markdown link", "Root-relative anchored link"],
  ["document-relative markdown link", "Relative anchored link"],
  ["link to an explicit index.html", "Explicit index anchored link"]
] as const

const PLAIN_LINKS = [
  ["resource_link", "Plain resource link"],
  ["markdown link", "Plain page link"]
] as const

/**
 * The click has to open the target page itself (a directory listing has a
 * different title) and scroll to the named anchor, which sits far below the
 * fold.
 */
const expectAtTargetAnchor = async (page: Page, anchor: string) => {
  await expect(page).toHaveTitle(/Fragment Link Target/)
  const url = new URL(page.url())
  expect(url.pathname).toMatch(/\/pages\/fragment-link-target\/index\.html$/)
  expect(url.hash).toBe(`#${anchor}`)
  await expect(page.locator(":target")).toHaveAttribute("name", anchor)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)
}

test.describe("Course v3 offline fragment and query links", () => {
  for (const [label, name] of ANCHORED_LINKS) {
    test(`${label} opens the page and jumps to its anchor`, async ({
      page
    }) => {
      await page.goto(offlineV3FileUrl(SOURCE))
      const link = page.getByRole("link", { name, exact: true })

      const href = await expectLocalPackageHref(link)
      expect(href).toMatch(/fragment-link-target\/index\.html#Lecture_Video1$/)

      await link.click()
      await expectAtTargetAnchor(page, "Lecture_Video1")
    })
  }

  test("link with a query opens the page", async ({ page }) => {
    await page.goto(offlineV3FileUrl(SOURCE))
    const link = page.getByRole("link", { name: "Query link", exact: true })

    const href = await expectLocalPackageHref(link)
    expect(href).toMatch(
      /fragment-link-target\/index\.html\?from=fragment-links$/
    )

    await link.click()
    await expect(page).toHaveTitle(/Fragment Link Target/)
    expect(new URL(page.url()).search).toBe("?from=fragment-links")
  })

  test("link with a query and a fragment keeps both, in that order", async ({
    page
  }) => {
    await page.goto(offlineV3FileUrl(SOURCE))
    const link = page.getByRole("link", {
      name:  "Query and anchored link",
      exact: true
    })

    const href = await expectLocalPackageHref(link)
    expect(href).toMatch(
      /fragment-link-target\/index\.html\?from=fragment-links#Lecture_Video1$/
    )

    await link.click()
    await expectAtTargetAnchor(page, "Lecture_Video1")
    expect(new URL(page.url()).search).toBe("?from=fragment-links")
  })

  test("link within the page jumps to its target without leaving the page", async ({
    page
  }) => {
    await page.goto(offlineV3FileUrl(SOURCE))
    const link = page.getByRole("link", {
      name:  "Jump to the in-page target",
      exact: true
    })

    await expect(link).toHaveAttribute("href", "#in-page-target")

    await link.click()
    const url = new URL(page.url())
    expect(url.pathname).toMatch(/\/pages\/fragment-links\/index\.html$/)
    expect(url.hash).toBe("#in-page-target")
    await expect(page.locator(":target")).toHaveAttribute(
      "id",
      "in-page-target"
    )
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0)
  })

  for (const [label, name] of PLAIN_LINKS) {
    test(`${label} without a fragment still opens the page`, async ({
      page
    }) => {
      await page.goto(offlineV3FileUrl(SOURCE))
      const link = page.getByRole("link", { name, exact: true })

      const href = await expectLocalPackageHref(link)
      expect(href).toMatch(/fragment-link-target\/index\.html$/)

      await link.click()
      await expect(page).toHaveTitle(/Fragment Link Target/)
      expect(new URL(page.url()).hash).toBe("")
    })
  }

  test("email and ftp links are left alone", async ({ page }) => {
    await page.goto(offlineV3FileUrl(SOURCE))

    await expect(
      page.getByRole("link", { name: "Email link", exact: true })
    ).toHaveAttribute("href", "mailto:someone@example.com")

    await expect(
      page.getByRole("link", { name: "FTP link", exact: true })
    ).toHaveAttribute("href", "ftp://ftp.example.com/pub/notes.txt")
  })

  test("absolute links keep their fragment", async ({ page }) => {
    await page.goto(offlineV3FileUrl(SOURCE))

    await expect(
      page.getByRole("link", { name: "Absolute anchored link", exact: true })
    ).toHaveAttribute("href", "https://example.com/page/#frag")
  })

  test("no link on the page has index.html after a fragment or query", async ({
    page
  }) => {
    await page.goto(offlineV3FileUrl(SOURCE))

    // The regression guard: a catch-all for any link shape that appends
    // index.html to the end of the whole URL instead of to its path.
    const misplaced = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .map(a => a.getAttribute("href") ?? "")
        .filter(href => /[#?].*\/index\.html$/.test(href))
    )

    expect(misplaced).toEqual([])
  })
})
