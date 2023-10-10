import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Resource list shows correct resource types", async ({ page }) => {
  const expectedResources = [
    {
      title:        "file.mp4",
      resourceType: "video"
    },
    {
      title:        "file.png",
      resourceType: "file"
    },
    {
      title:        "file.pdf",
      resourceType: "pdf"
    },
    {
      title:        "file.docx",
      resourceType: "file"
    },
    {
      title:        "file.py",
      resourceType: "file"
    },
    {
      title:        "file.txt",
      resourceType: "file"
    }
  ]

  const course = new CoursePage(page, "course")
  await course.goto("/lists/a-resource-list")

  for (const expectedResource of expectedResources) {
    const resource = await page.locator(".resource-item", {
      has: page.getByRole("link", { name: expectedResource.title })
    })

    const resourceType = await resource.getByText(
      expectedResource.resourceType,
      { exact: true }
    )

    await expect(resource).toBeVisible()
    await expect(resourceType).toBeVisible()
  }
})
