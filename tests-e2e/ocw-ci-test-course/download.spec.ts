import { test, expect } from "../util/fixtures"
import { CoursePage, expectLocalPackageHref } from "../util"

test("Download page offers the course ZIP online and Browse Resources offline", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/download", { waitUntil: "domcontentloaded" })
  const downloadButton = page.getByRole("link", {
    name:  "Download Course",
    exact: true
  })

  if (siteAlias === "course-offline") {
    await expect(downloadButton).toHaveCount(0)
    const browseButton = page.getByRole("button", {
      name: "Browse Resources"
    })
    await expect(browseButton).toBeVisible()
    await expectLocalPackageHref(browseButton)
    return
  }

  await expect(downloadButton).toBeVisible()
  await expect(downloadButton).toHaveAttribute(
    "href",
    /\/courses\/ocw-ci-test-course\/ocw-ci-test-course\.zip$/
  )
})

test("Download File shows keyboard focus in high-contrast mode", async ({
  page,
  siteAlias
}) => {
  await page.emulateMedia({ forcedColors: "active" })
  const course = new CoursePage(page, siteAlias)
  await course.goto("/resources/file_txt", { waitUntil: "domcontentloaded" })
  const button = page.getByRole("link", { name: "Download File", exact: true })
  await expect(button).toHaveAttribute(
    "href",
    siteAlias === "course-offline" ?
      "../../static_resources/file.txt" :
      /\/courses\/ocw-ci-test-course\/file\.txt$/
  )

  const card = page.locator(".resource-item")
  const before = await card.screenshot({ animations: "disabled" })
  const thumbnail = page.getByRole("link", {
    name:  "Download file",
    exact: true
  })
  await thumbnail.press("Tab")
  await expect(button).toBeFocused()
  const focused = await card.screenshot({ animations: "disabled" })
  expect(focused.equals(before), "Keyboard focus should be visible").toBe(false)
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
