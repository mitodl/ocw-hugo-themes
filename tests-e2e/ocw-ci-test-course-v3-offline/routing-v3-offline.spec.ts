import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

test.describe("offline-v3 routing", () => {
  test("shortcode-generated resource links stay package-local", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/pages/shortcode-demos"))

    const resourceLink = page.getByRole("link", {
      name: "Resource link to First Test Page"
    })

    const href = await expectLocalPackageHref(resourceLink)
    expect(href).toContain("first-test-page-title/index.html")

    await page.goto(new URL(href, page.url()).href)
    expect(page.url()).toContain(
      "ocw-ci-test-course-v3-offline/pages/first-test-page-title"
    )
  })

  test("resource links inside subscript and superscript content stay package-local", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/pages/subscripts-and-superscripts"))

    const internalScriptLink = page.locator("a", {
      has: page.locator("sup", { hasText: "‡" })
    })
    const href = await expectLocalPackageHref(internalScriptLink)

    expect(href).toContain("subscripts-and-superscripts/index.html")
  })

  test("embedded video page links stay package-local", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/video-series-overview"))

    const viewVideoPageLink = page.getByRole("link", {
      name: "View video page"
    })
    const href = await expectLocalPackageHref(viewVideoPageLink)
    expect(href).toContain(
      "resources/ocw_test_course_mit8_01f16_l01v01_360p/index.html"
    )

    await page.goto(new URL(href, page.url()).href)
    expect(page.url()).toContain(
      "ocw-ci-test-course-v3-offline/resources/ocw_test_course_mit8_01f16_l01v01_360p"
    )
  })

  test("resource card titles and non-video download links stay package-local", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/lists/a-resource-list"))

    const pdfCard = page.locator(".resource-card", {
      has: page.locator(".resource-card-title", { hasText: "file.pdf" })
    })
    const titleLink = pdfCard.locator(".resource-card-title")
    const downloadLink = pdfCard.locator(".resource-card-thumbnail-link")

    const titleHref = await expectLocalPackageHref(titleLink)
    expect(titleHref).toContain("resources/file_pdf/index.html")

    const assetHref = await expectLocalPackageHref(downloadLink)
    expect(assetHref).toContain("static_resources/")
    expect(assetHref).toMatch(/\.pdf$/)
    await expect(downloadLink).toHaveAttribute("download")
  })

  test("download-page resource links stay package-local", async ({ page }) => {
    await page.goto(offlineFileUrl("/download"))

    // Expand the collapsed "Activity Assignments" section
    await page
      .locator(".resource-list-toggle-link.collapsed", {
        hasText: "Activity Assignments"
      })
      .click()

    const resourceCard = page.locator(".resource-card", {
      has: page.locator(".resource-card-title", { hasText: "example_jpg.jpg" })
    })
    const titleLink = resourceCard.locator(".resource-card-title")
    const downloadLink = resourceCard.locator(".resource-card-thumbnail-link")

    const titleHref = await expectLocalPackageHref(titleLink)
    expect(titleHref).toContain("resources/example_jpg/index.html")

    const assetHref = await expectLocalPackageHref(downloadLink)
    expect(assetHref).toContain("static_resources/")
    expect(assetHref).toMatch(/\.jpg$/)
  })
})
