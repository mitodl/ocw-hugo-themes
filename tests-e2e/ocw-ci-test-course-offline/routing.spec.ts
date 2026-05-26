import { test, expect } from "@playwright/test"
import { offlineV2FileUrl, expectLocalPackageHref } from "../util/offline-build"

test("Desktop nav links are relative (package-local)", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/"))
  // v2 offline uses .course-nav; exclude external links (e.g. OCW no-warning) that live in collapsed subsections
  const navLinks = page.locator(
    ".course-nav .course-nav-parent a.nav-link[href]:not([href^='http'])"
  )
  const count = await navLinks.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < Math.min(count, 5); i++) {
    await expectLocalPackageHref(navLinks.nth(i))
  }
})

test("Shortcode resource_link on shortcode-demos page is local", async ({
  page
}) => {
  await page.goto(offlineV2FileUrl("/pages/shortcode-demos"))
  // resource_link shortcode generates a page link, not a resources/ URL
  const resourceLink = page.getByRole("link", {
    name: "Resource link to First Test Page"
  })
  const href = await expectLocalPackageHref(resourceLink)
  expect(href).toContain("first-test-page-title")
})
