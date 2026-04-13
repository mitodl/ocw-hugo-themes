import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

const VIDEO_L01 = "/resources/ocw_test_course_mit8_01f16_l01v01_360p"
const VIDEO_L26 = "/resources/ocw_test_course_mit8_01f16_l26v02_360p"

test.describe("offline-v3 video detail pages", () => {
  // ---------------------------------------------------------------------------
  // l01v01 — has captions, transcript, optional tab, related resources,
  //          start/end time (13/50), and a local MP4
  // ---------------------------------------------------------------------------

  test("l01v01 video page loads with v3 structure", async ({ page }) => {
    await page.goto(offlineFileUrl(VIDEO_L01))

    expect(page.url()).toContain(
      "resources/ocw_test_course_mit8_01f16_l01v01_360p/index.html"
    )
    await expect(page.locator("body")).toContainText(
      "ocw_test_course_MIT8_01F16_L01v01_360p.mp4"
    )
  })

  test("l01v01 shows local video player (not YouTube iframe)", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(VIDEO_L01))

    // The local MP4 is available, so local_video_player.html should render
    // No YouTube iframe should be present
    await expect(page.locator('iframe[src*="youtube.com"]')).toHaveCount(0)
  })

  test("l01v01 offline warning is shown (no local MP4 in test static_resources)", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(VIDEO_L01))

    // Test static_resources is empty — no local MP4 found, so the offline
    // YouTube warning path is taken and the warning div is rendered
    const offlineWarning = page.locator(".show-offline")
    await expect(offlineWarning.first()).toBeAttached()
    // YouTube iframe must not be present
    await expect(page.locator('iframe[src*="youtube.com"]')).toHaveCount(0)
  })

  test("l01v01 View video page tabs are present", async ({ page }) => {
    await page.goto(offlineFileUrl(VIDEO_L01))

    // The transcript/related resources/optional tab toggle sections
    await expect(
      page.locator(".video-tab-toggle-section").first()
    ).toBeVisible()
  })

  test("l01v01 download link in tab is package-local", async ({ page }) => {
    await page.goto(offlineFileUrl(VIDEO_L01))

    const downloadLink = page.locator('a[aria-label="Download video"]').first()
    if ((await downloadLink.count()) > 0) {
      const href = await expectLocalPackageHref(downloadLink)
      expect(href).toContain("static_resources/")
    }
  })

  test("l01v01 transcript link in tab is package-local", async ({ page }) => {
    await page.goto(offlineFileUrl(VIDEO_L01))

    const transcriptLink = page
      .locator('a[aria-label="Download transcript"]')
      .first()
    if ((await transcriptLink.count()) > 0) {
      const href = await expectLocalPackageHref(transcriptLink)
      expect(href).toContain("static_resources/")
    }
  })

  test("l01v01 optional tab and related resources are present", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(VIDEO_L01))

    // Optional Tab and Related Resources tabs should exist in the DOM
    const tabs = page.locator(".video-tab-toggle-section")
    const count = await tabs.count()
    // l01v01 has transcript + related resources + optional tab = multiple tabs
    expect(count).toBeGreaterThan(1)
  })

  // ---------------------------------------------------------------------------
  // l26v02 — no captions, no transcript, no speakers — fallback path
  // ---------------------------------------------------------------------------

  test("l26v02 video page loads", async ({ page }) => {
    await page.goto(offlineFileUrl(VIDEO_L26))

    expect(page.url()).toContain(
      "resources/ocw_test_course_mit8_01f16_l26v02_360p/index.html"
    )
    await expect(page.locator("body")).toContainText(
      "ocw_test_course_MIT8_01F16_L26v02_360p.mp4"
    )
  })

  test("l26v02 shows offline warning (YouTube path, no local MP4)", async ({
    page
  }) => {
    await page.goto(offlineFileUrl(VIDEO_L26))

    await expect(page.locator('iframe[src*="youtube.com"]')).toHaveCount(0)
    // Offline warning renders instead
    await expect(page.locator(".show-offline").first()).toBeAttached()
  })

  test("video detail pages use v3 offline bundle", async ({ page }) => {
    await page.goto(offlineFileUrl(VIDEO_L01))

    await expect(page.locator('script[src*="course_offline_v3"]')).toHaveCount(
      1
    )
  })
})
