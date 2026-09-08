import { test, expect } from "@playwright/test"
import { offlineV2FileUrl, expectLocalPackageHref } from "../util/offline-build"

/**
 * file://-only: these assert that relative-path resolution actually works
 * with no server involved, which the HTTP-served siteAlias-unified specs
 * cannot verify. No online counterpart - intentionally not unified.
 */

test("Offline warning is shown on video page", async ({ page }) => {
  await page.goto(
    offlineV2FileUrl("/resources/ocw_test_course_mit8_01f16_l01v01_360p")
  )
  const offlineWarning = page.locator(".show-offline.alert.alert-warning")
  await expect(offlineWarning).toBeVisible()
})

test("Fallback iframe container is absent on offline video page", async ({
  page
}) => {
  await page.goto(
    offlineV2FileUrl("/resources/ocw_test_course_mit8_01f16_l01v01_360p")
  )
  const fallbackContainer = page.locator(".video-fallback-container")
  await expect(fallbackContainer).toHaveCount(0)
})

test("Transcript link is local", async ({ page }) => {
  await page.goto(
    offlineV2FileUrl("/resources/ocw_test_course_mit8_01f16_l01v02_360p_mp4")
  )
  const transcriptLink = page.locator(
    "a[href*='transcript'], a[href*='captions']"
  )
  await expect(transcriptLink.first()).toBeAttached()
  await expectLocalPackageHref(transcriptLink.first())
})
