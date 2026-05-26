import { test, expect } from "@playwright/test"
import { offlineV2FileUrl, expectLocalPackageHref } from "../util/offline-build"

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

test("Transcript link is local if present", async ({ page }) => {
  await page.goto(
    offlineV2FileUrl("/resources/ocw_test_course_mit8_01f16_l01v01_360p")
  )
  const transcriptLink = page.locator(
    "a[href*='transcript'], a[href*='captions']"
  )
  // The test video fixture does not include a transcript file;
  // assert locality only when the link is actually present.
  const count = await transcriptLink.count()
  if (count > 0) {
    await expectLocalPackageHref(transcriptLink.first())
  }
})
