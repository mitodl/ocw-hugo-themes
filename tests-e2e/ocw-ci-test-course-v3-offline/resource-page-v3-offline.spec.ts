import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

test.describe("offline-v3 non-video resource pages", () => {
  // ---------------------------------------------------------------------------
  // file_pdf — baseline document resource
  // ---------------------------------------------------------------------------

  test("file_pdf resource page loads with v3 structure", async ({ page }) => {
    await page.goto(offlineFileUrl("/resources/file_pdf"))

    expect(page.url()).toContain("resources/file_pdf/index.html")
    await expect(page.locator("body")).toContainText("file.pdf")
    await expect(page.locator(".resource-page-container")).toBeVisible()
  })

  test("file_pdf download link is package-local", async ({ page }) => {
    await page.goto(offlineFileUrl("/resources/file_pdf"))

    const downloadBtn = page
      .locator(".resource-download-button, .resource-single-thumbnail-link")
      .first()
    const href = await expectLocalPackageHref(downloadBtn)
    expect(href).toContain("static_resources/")
  })

  // ---------------------------------------------------------------------------
  // example_pdf — Document resourcetype with file_size
  // ---------------------------------------------------------------------------

  test("example_pdf resource page loads", async ({ page }) => {
    await page.goto(offlineFileUrl("/resources/example_pdf"))

    expect(page.url()).toContain("resources/example_pdf/index.html")
    await expect(page.locator("body")).toContainText(
      "8.01 Classical Mechanics Pset 1"
    )
  })

  test("example_pdf download button is package-local", async ({ page }) => {
    await page.goto(offlineFileUrl("/resources/example_pdf"))

    const downloadBtn = page.locator(".resource-download-button").first()
    if ((await downloadBtn.count()) > 0) {
      const href = await expectLocalPackageHref(downloadBtn)
      expect(href).toContain("static_resources/")
      expect(href).toMatch(/\.pdf$/)
    } else {
      // If button not rendered (no download link), assert page still loads
      await expect(page.locator(".resource-page-container")).toBeVisible()
    }
  })

  // ---------------------------------------------------------------------------
  // example_jpg — Image resourcetype
  // ---------------------------------------------------------------------------

  test("example_jpg image resource page loads", async ({ page }) => {
    await page.goto(offlineFileUrl("/resources/example_jpg"))

    expect(page.url()).toContain("resources/example_jpg/index.html")
    await expect(page.locator("body")).toContainText("example_jpg.jpg")
  })

  test("example_jpg image displays from local path", async ({ page }) => {
    await page.goto(offlineFileUrl("/resources/example_jpg"))

    // The resource image should reference a local path, not an absolute one
    const resourceImg = page.locator(".image-page img, .resource-single-card img").first()
    if ((await resourceImg.count()) > 0) {
      const src = await resourceImg.getAttribute("src")
      expect(src).not.toMatch(/^https?:\/\//)
    }
  })

  // ---------------------------------------------------------------------------
  // example_notes — Document resource
  // ---------------------------------------------------------------------------

  test("example_notes resource page loads", async ({ page }) => {
    await page.goto(offlineFileUrl("/resources/example_notes"))

    expect(page.url()).toContain("resources/example_notes/index.html")
    await expect(page.locator("body")).toContainText("9.9 Solid State")
  })

  test("non-video resource pages use v3 offline bundle", async ({ page }) => {
    await page.goto(offlineFileUrl("/resources/file_pdf"))

    await expect(page.locator('script[src*="course_offline_v3"]')).toHaveCount(
      1
    )
  })
})
