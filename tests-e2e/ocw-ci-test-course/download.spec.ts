import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

test("Download button exists for test course", async ({ page, siteAlias }) => {
  test.skip(
    siteAlias === "course-offline",
    "Offline builds show 'Browse Resources' instead of 'Download course'"
  )
  const course = new CoursePage(page, siteAlias)
  await course.goto("/download")
  const downloadButton = page.getByRole("link", { name: "Download course" })
  await expect(downloadButton).toBeVisible()
})

test("List of resources appears on download page", async ({ page, siteAlias }) => {
  test.skip(
    siteAlias === "course-offline",
    "Resource hrefs are relative in offline builds, not absolute /courses/... paths"
  )
  const course = new CoursePage(page, siteAlias)
  await course.goto("/download")
  const tab = page.getByRole("link", { name: "Activity Assignments" })
  await tab.click()
  const resourceLink = page.getByRole("link", { name: "example_jpg.jpg" })
  const href = await resourceLink.getAttribute("href")
  expect(href).toBe("/courses/ocw-ci-test-course/resources/example_jpg/")
})
