import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Download button exists for test course", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/download")
  const downloadButton = page.getByRole("link", { name: "Download course" })
  await expect(downloadButton).toBeVisible()
})

test("List of resources appears on download page", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/download")
  const tab = page.getByRole("link", { name: "Activity Assignments" })
  await tab.click()
  const resourceLink = page.getByRole("link", { name: "example_jpg.jpg" })
  const href = await resourceLink.getAttribute("href")
  expect(href).toBe("/courses/ocw-ci-test-course/resources/example_jpg/")
})
