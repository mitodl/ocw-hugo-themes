import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Resource list shows correct thumbnails and aria labels for different types of files", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/lists/a-resource-list")
  const resourceLocators = await page
    .locator(".resource-list-item > .row")
    .all()

  for (const resource of resourceLocators.values()) {
    const thumbnailLocator = resource.locator("img.resource-thumbnail")

    expect(thumbnailLocator).toBeVisible()

    const title = await resource.locator(".resource-list-title").textContent()
    const src = await thumbnailLocator.getAttribute("src")
    const ariaLabel = await thumbnailLocator.getAttribute("aria-label")

    if (title?.endsWith(".pdf")) {
      expect(src).toBe("/static_shared/images/pdf_thumbnail.png")
      expect(ariaLabel).toBe("PDF File")
    } else if (title?.endsWith(".mp4")) {
      expect(src).toBe("/static_shared/images/mobile_video_thumbnail.png")
      expect(ariaLabel).toBe("Video File")
    } else if (title?.endsWith(".png")) {
      expect(ariaLabel).toBe("Image File")
      expect(src).toBe("/static_shared/images/file_thumbnail.png")
    } else {
      expect(src).toBe("/static_shared/images/file_thumbnail.png")
      expect(ariaLabel).toBe("File")
    }
  }
})
