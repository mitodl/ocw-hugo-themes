import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

test("Download button exists for test course", async ({ page, siteAlias }) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/download")

  if (siteAlias === "course-offline") {
    // Offline v2 replaces the download CTA with a "Browse Resources" button.
    await expect(
      page.getByRole("link", { name: "Download course" })
    ).toHaveCount(0)
    // Rendered as `<a role="button" ...>` (Bootstrap's pattern for a link
    // styled as a button), so its accessible role is "button", not "link".
    const browseButton = page.getByRole("button", {
      name: "Browse Resources"
    })
    await expect(browseButton).toBeVisible()
    const href = await browseButton.getAttribute("href")
    expect(href).not.toMatch(/^https?:\/\//)
  } else {
    const downloadButton = page.getByRole("link", { name: "Download course" })
    await expect(downloadButton).toBeVisible()
  }
})

test("List of resources appears on download page", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/download")
  const tab = page.getByRole("link", { name: "Activity Assignments" })
  await tab.click()
  const resourceLink = page.getByRole("link", { name: "example_jpg.jpg" })
  const href = await resourceLink.getAttribute("href")
  if (siteAlias === "course-offline") {
    // Offline builds use relative hrefs
    expect(href).toMatch(/resources\/example_jpg/)
    expect(href).not.toMatch(/^https?:\/\//)
    expect(href).not.toMatch(/^\/courses\//)
  } else {
    expect(href).toBe("/courses/ocw-ci-test-course/resources/example_jpg/")
  }
})
