import { test, expect } from "../util/fixtures"
import { CoursePage, expectLocalPackageHref } from "../util"

test.describe("Course v3 image gallery", () => {
  test("image gallery page renders and container is present", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery")

    await expect(page.locator("body")).toContainText("Image Gallery")
    await expect(page.locator(".image-gallery")).toBeVisible()
  })

  test("gallery nanogallery2 init script is present", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery")

    // The gallery script fires window.initNanogallery2 on load
    const pageContent = await page.content()
    expect(pageContent).toContain("initNanogallery2")
  })

  test("gallery data-base-url is package-appropriate", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery")

    const gallery = page.locator(".image-gallery")
    const baseUrl = await gallery.getAttribute("data-base-url")
    expect(baseUrl).toBeTruthy()

    if (siteAlias === "course-v3-offline") {
      expect(baseUrl).not.toMatch(/^https?:\/\//)
    }
  })

  test("shortcode resource links on shortcode-demos are correctly scoped", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/shortcode-demos")

    const resourceLink = page.getByRole("link", {
      name: "Resource link to First Test Page"
    })

    if (siteAlias === "course-v3-offline") {
      const href = await expectLocalPackageHref(resourceLink)
      expect(href).toContain("first-test-page-title/index.html")
    } else {
      await expect(resourceLink).toHaveAttribute(
        "href",
        /\/pages\/first-test-page-title\/?$/
      )
    }
  })

  test("image gallery displays thumbnail and opens viewer", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery")

    const thumbnailTitle = page.getByText("A dog having fun")
    await expect(thumbnailTitle).toBeVisible()

    await thumbnailTitle.click()

    const viewer = page.locator(".nGY2Viewer")
    await expect(viewer).toBeVisible()
  })
})
