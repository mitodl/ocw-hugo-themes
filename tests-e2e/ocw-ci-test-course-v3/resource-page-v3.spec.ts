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

  test("The Download button and thumbnail point to the course PDF", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/resources/file_pdf", { waitUntil: "domcontentloaded" })

    const pdf =
      siteAlias === "course-v3-offline" ?
        "../../static_resources/file2.pdf" :
        /\/courses\/o\/ocw-ci-test-course\/file2\.pdf$/
    for (const name of ["Download", "Download file.pdf"]) {
      const link = page.getByRole("link", { name, exact: true })
      await expect(link).toHaveAttribute("download", "")
      await expect(link).toHaveAttribute("href", pdf)
    }
  })

  test("Resource page displays metadata", async ({ page, siteAlias }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/resources/file_pdf")

    const title = page.locator(".resource-single-title")
    await expect(title).toHaveText("file.pdf")

    const license = page.locator(".resource-type-field", {
      hasText: "Resource License:"
    })
    await expect(
      license.getByRole("link", { name: "CC BY-NC-SA" })
    ).toHaveAttribute(
      "href",
      "https://creativecommons.org/licenses/by-nc-sa/4.0/"
    )
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
