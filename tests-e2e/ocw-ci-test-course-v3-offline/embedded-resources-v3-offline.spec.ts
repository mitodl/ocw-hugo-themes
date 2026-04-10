import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

test.describe("offline-v3 embedded resource pages", () => {
  // ---------------------------------------------------------------------------
  // video-series-overview — single embedded video
  // ---------------------------------------------------------------------------

  test("embedded video renders offline warning on video-series-overview", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/pages/video-series-overview"))

    // The offline warning div must be visible (YouTube player is suppressed)
    await expect(page.locator(".show-offline")).toBeVisible()
    // The YouTube iframe must NOT be present
    await expect(
      page.locator('iframe[src*="youtube.com"]')
    ).toHaveCount(0)
  })

  test("View video page link is package-local on video-series-overview", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/pages/video-series-overview"))

    const link = page.getByRole("link", { name: "View video page" })
    const href = await expectLocalPackageHref(link)
    expect(href).toContain(
      "resources/ocw_test_course_mit8_01f16_l01v01_360p/index.html"
    )
  })

  test("download link on embedded video is package-local", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/video-series-overview"))

    // The download link is inside the tab popup as "Download video"
    const downloadLink = page
      .locator('a[aria-label="Download video"]')
      .first()
    const href = await expectLocalPackageHref(downloadLink)
    expect(href).toContain("static_resources/")
  })

  // ---------------------------------------------------------------------------
  // multiple-videos-series-overview — three repeated embeds of the same video
  // ---------------------------------------------------------------------------

  test("multiple embedded videos render on multiple-videos-series-overview", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/pages/multiple-videos-series-overview"))

    // Three copies of the same resource — each should show the offline warning
    const offlineWarnings = page.locator(".show-offline")
    await expect(offlineWarnings).toHaveCount(3)
  })

  test("all View video page links are package-local on multiple-videos page", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/pages/multiple-videos-series-overview"))

    const links = page.getByRole("link", { name: "View video page" })
    const count = await links.count()
    expect(count).toBe(3)

    for (let i = 0; i < count; i++) {
      const href = await expectLocalPackageHref(links.nth(i))
      expect(href).toContain(
        "resources/ocw_test_course_mit8_01f16_l01v01_360p/index.html"
      )
    }
  })
})
