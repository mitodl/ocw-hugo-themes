import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Resource list shows correct resource categories", async ({ page }) => {
  const expectedResources = [
    {
      title:            "file.mp4",
      resourceCategory: "video"
    },
    {
      title:            "file.png",
      resourceCategory: "file"
    },
    {
      title:            "file.pdf",
      resourceCategory: "pdf"
    },
    {
      title:            "file.docx",
      resourceCategory: "file"
    },
    {
      title:            "file.py",
      resourceCategory: "file"
    },
    {
      title:            "file.txt",
      resourceCategory: "file"
    }
  ]

  const course = new CoursePage(page, "course")
  await course.goto("/lists/a-resource-list")

  for (const expectedResource of expectedResources) {
    const resource = await page.locator(".resource-item", {
      has: page.getByRole("link", { name: expectedResource.title })
    })

    const resourceCategory = await resource.getByText(
      expectedResource.resourceCategory,
      { exact: true }
    )

    await expect(resource).toBeVisible()
    await expect(resourceCategory).toBeVisible()
  }
})
