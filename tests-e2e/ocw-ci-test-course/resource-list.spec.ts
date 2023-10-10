import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Resource list shows correct thumbnails and aria labels for different types of files", async ({
  page
}) => {
  const expectedResources = [
    {
      title:     "file.mp4",
      thumbnail: {
        src:       "/static_shared/images/mobile_video_thumbnail.png",
        ariaLabel: "Video File"
      }
    },
    {
      title:     "file.png",
      thumbnail: {
        src:       "/static_shared/images/file_thumbnail.png",
        ariaLabel: "Image File"
      }
    },
    {
      title:     "file.pdf",
      thumbnail: {
        src:       "/static_shared/images/pdf_thumbnail.png",
        ariaLabel: "PDF File"
      }
    },
    {
      title:     "file.docx",
      thumbnail: {
        src:       "/static_shared/images/file_thumbnail.png",
        ariaLabel: "File"
      }
    },
    {
      title:     "file.py",
      thumbnail: {
        src:       "/static_shared/images/file_thumbnail.png",
        ariaLabel: "File"
      }
    },
    {
      title:     "file.txt",
      thumbnail: {
        src:       "/static_shared/images/file_thumbnail.png",
        ariaLabel: "File"
      }
    }
  ]

  const course = new CoursePage(page, "course")
  await course.goto("/lists/a-resource-list")

  for (const expectedResource of expectedResources) {
    const resource = await page.locator(".resource-item", {
      has: page.getByRole("link", { name: expectedResource.title })
    })

    const thumbnail = await resource.getByRole("img", {
      name: expectedResource.thumbnail.ariaLabel
    })
    const src = await thumbnail.getAttribute("src")

    await expect(thumbnail).toBeVisible()
    expect(src).toBe(expectedResource.thumbnail.src)
  }
})
