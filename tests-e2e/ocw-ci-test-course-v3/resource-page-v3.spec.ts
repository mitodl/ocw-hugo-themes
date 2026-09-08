import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

test.describe("Course v3 Single Resource Page", () => {
  test("Resource page has correct width", async ({ page, siteAlias }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/resources/file_pdf")

    const container = page.locator(".resource-page-container")
    await expect(container).toBeVisible()
    await expect(container).toHaveClass(/w-100/)
  })

  test("Resource page displays thumbnail correctly", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
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

    const thumbnailLink = page.locator(".resource-single-thumbnail-link")
    await expect(thumbnailLink).toHaveAttribute(
      "aria-label",
      "Download file.pdf"
    )
  })

  test("Resource page displays download button correctly", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
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

  test("Resource page displays metadata", async ({ page, siteAlias }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/resources/file_pdf")

    const title = page.locator(".resource-single-title")
    await expect(title).toHaveText("file.pdf")
  })

  test("Resource page download link is package-local when offline", async ({
    page,
    siteAlias
  }) => {
    test.skip(
      siteAlias !== "course-v3-offline",
      "Package-local paths only exist in the offline build"
    )
    const course = new CoursePage(page, siteAlias)
    await course.goto("/resources/file_pdf")

    const downloadBtn = page
      .locator(".resource-download-button, .resource-single-thumbnail-link")
      .first()
    const href = await downloadBtn.getAttribute("href")
    expect(href).not.toMatch(/^https?:\/\//)
    expect(href).not.toMatch(/^\//)
    expect(href).toContain("static_resources/")
  })

  test.describe("additional resource types", () => {
    const cases: { route: string; bodyText: string }[] = [
      {
        route:    "/resources/example_pdf",
        bodyText: "8.01 Classical Mechanics Pset 1"
      },
      { route: "/resources/example_jpg", bodyText: "example_jpg.jpg" },
      { route: "/resources/example_notes", bodyText: "9.9 Solid State" }
    ]

    for (const { route, bodyText } of cases) {
      test(`${route} loads with expected content`, async ({
        page,
        siteAlias
      }) => {
        const course = new CoursePage(page, siteAlias)
        await course.goto(route)

        await expect(page.locator("body")).toContainText(bodyText)
        await expect(page.locator(".resource-page-container")).toBeVisible()
      })
    }
  })
})
