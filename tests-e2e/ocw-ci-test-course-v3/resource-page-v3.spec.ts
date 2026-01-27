import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 Single Resource Page", () => {
  test("Resource page has correct width", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    const container = page.locator(".resource-page-container")
    await expect(container).toBeVisible()
    await expect(container).toHaveClass(/w-100/)
  })

  test("Resource page displays thumbnail correctly", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    const thumbnail = page.locator(
      ".resource-single-card .resource-card-thumbnail"
    )
    await expect(thumbnail).toBeVisible()

    // Check for PDF badge
    const badge = thumbnail.locator(".resource-card-type.pdf")
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText("pdf")
    await expect(badge).toHaveCSS("background-color", "rgb(163, 31, 52)") // #a31f34
  })

  test("Resource page displays download button correctly", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    const downloadButton = page.locator(".resource-download-button")
    await expect(downloadButton).toBeVisible()

    // Check styling
    await expect(downloadButton).toHaveCSS(
      "background-color",
      "rgb(117, 0, 20)"
    ) // #750014

    // Check valid href
    const href = await downloadButton.getAttribute("href")
    expect(href).toMatch(/.pdf$/)
  })

  test("Resource page displays metadata", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/resources/file_pdf")

    const title = page.locator(".resource-single-title")
    await expect(title).toHaveText("file.pdf")
  })
})
