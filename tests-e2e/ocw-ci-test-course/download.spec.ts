import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Download button exists for test course", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/download")
  const downloadButton = page.getByRole("link", { name: "Download course" })
  await expect(downloadButton).toBeVisible()
})
