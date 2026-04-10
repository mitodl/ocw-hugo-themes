import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

/**
 * Step 15 – External-resource behavior (offline-v3)
 *
 * Acceptance route: /pages/external-resources-page
 *
 * The page contains:
 *  - Two `resource_link` shortcodes to Google.com (external, has_external_license_warning: true)
 *  - A `resource_link` shortcode to a broken/missing external resource
 *  - A `resource_link` shortcode to example_jpg (internal resource → local link)
 *  - A plain markdown `https://google.com` link
 *  - A `resource_link` to OCW main (ocw.mit.edu, has_external_license_warning: false)
 */

const EXTERNAL_RESOURCES_PAGE = "/pages/external-resources-page"

test.describe("offline-v3 external resources", () => {
  // ---------------------------------------------------------------------------
  // Page load
  // ---------------------------------------------------------------------------

  test("external-resources page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

    expect(page.url()).toContain("external-resources-page/index.html")
    await expect(page.locator("body")).toContainText("External Resources Page")
  })

  // ---------------------------------------------------------------------------
  // External-link-warning links (Google.com with has_external_license_warning)
  // ---------------------------------------------------------------------------

  test("external link with warning has correct classes and target", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

    const link = page.getByRole("link", { name: "Google.com" }).first()
    await expect(link).toBeVisible()

    const cls = await link.getAttribute("class")
    expect(cls).toContain("external-link-warning")
    expect(cls).toContain("external-link")

    await expect(link).toHaveAttribute("href", "https://google.com")
    await expect(link).toHaveAttribute("target", "_blank")
  })

  // ---------------------------------------------------------------------------
  // External-link-warning modal HTML structure
  //
  // In file:// mode JS/CSS don't load (relative asset paths in the test env
  // nest wrong). Verify the STATIC HTML that enables the modal to work when
  // the package is used normally with JS running.
  // ---------------------------------------------------------------------------

  test("external-link-modal is present in the DOM", async ({ page }) => {
    await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

    const modal = page.locator("#external-link-modal")
    await expect(modal).toBeAttached()
    // role="dialog" declared in the HTML
    await expect(modal).toHaveAttribute("role", "dialog")
  })

  test("modal contains the warning heading", async ({ page }) => {
    await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

    await expect(page.locator(".modal-title")).toContainText(
      "You are leaving MIT OpenCourseWare"
    )
  })

  test("modal has Stay Here and Continue action elements", async ({ page }) => {
    await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

    // Stay Here button dismisses via data-dismiss="modal"; use text locator since
    // the modal has aria-hidden="true" (getByRole respects it)
    const stayHere = page
      .locator("#external-link-modal button")
      .filter({ hasText: "Stay Here" })
    await expect(stayHere).toBeAttached()

    // Continue link receives the target URL from JS; starts with href="#"
    const continueBtn = page.locator("#external-link-modal a.btn-continue")
    await expect(continueBtn).toBeAttached()
    await expect(continueBtn).toHaveAttribute("target", "_blank")
  })

  test(
    "warning link has onClick=event.preventDefault() so JS can intercept",
    async ({ page }) => {
      await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

      const link = page
        .locator("p")
        .filter({ hasText: "This link opens a warning" })
        .getByRole("link")

      // Template sets onClick to prevent navigation before the modal JS kicks in
      const onClick = await link.getAttribute("onclick")
      expect(onClick).toContain("event.preventDefault")
    }
  )

  // ---------------------------------------------------------------------------
  // OCW link — no warning expected
  // ---------------------------------------------------------------------------

  test("OCW link does not have external-link class", async ({ page }) => {
    await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

    const link = page
      .locator("p")
      .filter({ hasText: "This link DOES NOT" })
      .getByRole("link")

    const cls = await link.getAttribute("class")
    expect(cls ?? "").not.toContain("external-link")
  })

  // ---------------------------------------------------------------------------
  // Internal resource link stays package-local
  // ---------------------------------------------------------------------------

  test("internal resource_link resolves to a local file:// path", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

    // The first paragraph has: resource_link "this" (internal) then [this](https://google.com)
    // Use the first "this" link which is the internal resource_link
    const link = page
      .locator("p")
      .filter({ hasText: "this is an internal link" })
      .getByRole("link", { name: "this" })
      .first()

    const href = await expectLocalPackageHref(link)
    // Internal resource should resolve inside the course package
    expect(href).not.toMatch(/^https?:\/\//)
  })

  // ---------------------------------------------------------------------------
  // Nav external resource links
  // ---------------------------------------------------------------------------

  test("nav external resource link (Google.com) is a true external link", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

    // Both desktop and mobile nav render the expand button — use first (desktop)
    const expandBtn = page
      .getByRole("button", { name: /Subsections for External Resources/i })
      .first()
    await expandBtn.click()

    // Find the Google.com nav link (scope to course-nav to avoid the page body link)
    const navLink = page
      .locator(".course-nav")
      .getByRole("link", { name: "Google.com" })
      .first()

    await expect(navLink).toBeVisible()
    await expect(navLink).toHaveAttribute("href", "https://google.com")

    const cls = await navLink.getAttribute("class")
    expect(cls).toContain("external-link-warning")
  })

  // ---------------------------------------------------------------------------
  // Regression: plain markdown external link is not mangled
  // ---------------------------------------------------------------------------

  test("plain markdown external link is present and points to google.com", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(EXTERNAL_RESOURCES_PAGE))

    // "And [this](https://google.com) is a plain markdown link." — plain <a> with no external class
    const link = page
      .locator("p")
      .filter({ hasText: "is a plain markdown link" })
      .locator('a[href="https://google.com"]:not(.external-link-warning)')

    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", "https://google.com")
  })
})
