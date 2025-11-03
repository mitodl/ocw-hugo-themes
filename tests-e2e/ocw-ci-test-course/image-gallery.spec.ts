import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Image gallery displays thumbnail and opens viewer with credit text", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/image-gallery")

  // Assert that there is a thumbnail image on the page with nanogallery2 structure
  const thumbnailContainer = page.locator(".image-gallery .nGY2GThumbnail")
  await expect(thumbnailContainer).toBeVisible()
  
  // Assert that the thumbnail has the expected text "A dog having fun"
  const thumbnailTitle = page.locator(".image-gallery .nGY2GThumbnailTitle")
  await expect(thumbnailTitle).toHaveText("A dog having fun")

  // Click on the thumbnail image
  await thumbnailContainer.click()

  // Wait for the nanogallery2 viewer to appear
  const viewer = page.locator(".nGY2Viewer")
  await expect(viewer).toBeVisible()

  // Assert that the image has the credit text "Distributed under CCC" overlayed
  const creditText = page.locator(":text('Distributed under the CCC.')")
  await expect(creditText).toBeVisible()
})
