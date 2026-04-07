import { test, expect, Locator } from "@playwright/test"
import { buildOfflineV3Site, offlineFileUrl } from "../util"

const expectLocalPackageHref = async (locator: Locator) => {
  const href = await locator.getAttribute("href")
  expect(href).toBeTruthy()
  expect(href).not.toMatch(/^https?:\/\//)
  expect(href).not.toMatch(/^\//)
  return href as string
}

test.describe("offline-v3 generic content pages", () => {
  let siteDir: string

  test.beforeAll(async () => {
    siteDir = await buildOfflineV3Site()
  })

  // ---------------------------------------------------------------------------
  // Acceptance route smoke tests
  // ---------------------------------------------------------------------------

  test("offline-v3 syllabus page renders with table", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/syllabus"))

    await expect(page.locator("body")).toContainText("Grading Policy")
    // Table must be present (page may have more than one table)
    await expect(page.locator("table").first()).toBeVisible()
    await expect(page.locator("table").first()).toContainText("Assignments")
  })

  test("offline-v3 section-1 page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/section-1"))

    expect(page.url()).toContain("pages/section-1/index.html")
    await expect(page.locator("body")).toContainText("Section 1")
  })

  test("offline-v3 subsection-1a page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/subsection-1a"))

    expect(page.url()).toContain("pages/subsection-1a/index.html")
    await expect(page.locator("body")).toContainText("Subsection 1a")
  })

  test("offline-v3 subsection-1b page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/subsection-1b"))

    expect(page.url()).toContain("pages/subsection-1b/index.html")
    await expect(page.locator("body")).toContainText("Subsection 1b")
  })

  test("offline-v3 first-test-page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/first-test-page-title"))

    expect(page.url()).toContain("first-test-page-title/index.html")
    await expect(page.locator("body")).toContainText("First Test Page")
  })

  test("offline-v3 second-test-page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/second-test-page"))

    expect(page.url()).toContain("second-test-page/index.html")
    await expect(page.locator("body")).toContainText("Second Test Page")
  })

  // ---------------------------------------------------------------------------
  // Nav link routing
  // ---------------------------------------------------------------------------

  test("nav links are package-local on an inner page", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/syllabus"))

    // Find the Section 1 nav link (top-level desktop nav)
    const navLink = page
      .locator(".course-nav.desktop .nav-link")
      .filter({ hasText: "Section 1 Menu Title" })
      .first()

    const href = await expectLocalPackageHref(navLink)
    expect(href).toContain("section-1/index.html")
  })

  test("nav link navigates correctly between pages", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/syllabus"))

    const navLink = page
      .locator(".course-nav.desktop .nav-link")
      .filter({ hasText: "Section 2 Menu Title" })
      .first()

    // Verify href is local before clicking
    await expectLocalPackageHref(navLink)
    await navLink.click()
    expect(page.url()).toContain("pages/assignments/index.html")
    await expect(page.locator("body")).toContainText("Section 2")
  })

  test("nested nav links (subsections) are package-local", async ({ page }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/syllabus"))

    const subsectionLink = page
      .locator(".course-nav.desktop .nav-link")
      .filter({ hasText: "Subsection 1a Menu Title" })
      .first()

    const href = await expectLocalPackageHref(subsectionLink)
    expect(href).toContain("subsection-1a/index.html")
  })

  // ---------------------------------------------------------------------------
  // No online-only leakage on generic pages
  // ---------------------------------------------------------------------------

  test("footer nav links are not hardcoded to learn.mit.edu", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(siteDir, "/pages/syllabus"))

    // Footer 'about', 'terms', 'contact', 'accessibility' links must NOT point
    // to the live learn.mit.edu domain — they should be resolved via site_root_url
    // which for the test build resolves to the local fixture server.
    const footerNav = page.locator(".footer-v3-right-container, footer")
    const footerLinks = footerNav.locator(
      "a[href*='about'], a[href*='terms'], a[href*='contact'], a[href*='accessibility']"
    )
    for (const link of await footerLinks.all()) {
      const href = await link.getAttribute("href")
      expect(href).not.toMatch(/learn\.mit\.edu/)
    }
  })
})
