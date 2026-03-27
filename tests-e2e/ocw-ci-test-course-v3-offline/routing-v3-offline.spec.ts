import { test, expect, Locator } from "@playwright/test"
import { CoursePage } from "../util"

const offlineCourse = (page: Parameters<typeof test>[0]["page"]) =>
  new CoursePage(page, "course-v3-offline")

const expectLocalPackageHref = async (locator: Locator) => {
  const href = await locator.getAttribute("href")
  expect(href).toBeTruthy()
  expect(href).not.toMatch(/^https?:\/\//)
  expect(href).not.toMatch(/^\//)
  return href as string
}

test("shortcode-generated resource links stay package-local", async ({
  page
}) => {
  const course = offlineCourse(page)
  await course.goto("/pages/shortcode-demos")

  const resourceLink = page.getByRole("link", {
    name: "Resource link to First Test Page"
  })

  const href = await expectLocalPackageHref(resourceLink)
  expect(href).toContain("first-test-page-title/index.html")

  await page.goto(new URL(href, page.url()).href)
  await expect(page).toHaveURL(
    /ocw-ci-test-course-v3-offline\/pages\/first-test-page-title\/?$/
  )
})

test("resource links inside subscript and superscript content stay package-local", async ({
  page
}) => {
  const course = offlineCourse(page)
  await course.goto("/pages/subscripts-and-superscripts")

  const internalScriptLink = page.locator("a", {
    has: page.locator("sup", { hasText: "‡" })
  })
  const href = await expectLocalPackageHref(internalScriptLink)

  expect(href).toContain("subscripts-and-superscripts/index.html")
})

test("embedded video page links stay package-local", async ({ page }) => {
  const course = offlineCourse(page)
  await course.goto("/pages/video-series-overview")

  const viewVideoPageLink = page.getByRole("link", { name: "View video page" })
  const href = await expectLocalPackageHref(viewVideoPageLink)
  expect(href).toContain(
    "resources/ocw_test_course_mit8_01f16_l01v01_360p/index.html"
  )

  await page.goto(new URL(href, page.url()).href)
  await expect(page).toHaveURL(
    /ocw-ci-test-course-v3-offline\/resources\/ocw_test_course_mit8_01f16_l01v01_360p\/?$/
  )
})

test("resource card titles and non-video download links stay package-local", async ({
  page
}) => {
  const course = offlineCourse(page)
  await course.goto("/lists/a-resource-list")

  const pdfCard = page.locator(".resource-card", {
    has: page.locator(".resource-card-title", { hasText: "file.pdf" })
  })
  const titleLink = pdfCard.locator(".resource-card-title")
  const downloadLink = pdfCard.locator(".resource-card-thumbnail-link")

  const titleHref = await expectLocalPackageHref(titleLink)
  expect(titleHref).toContain("resources/file_pdf/index.html")

  const assetHref = await expectLocalPackageHref(downloadLink)
  expect(assetHref).toContain("static_resources/")
  expect(assetHref).toMatch(/\.pdf$/)
  await expect(downloadLink).toHaveAttribute("download")
})

test("download-page resource links stay package-local", async ({ page }) => {
  const course = offlineCourse(page)
  await course.goto("/download")

  // Expand the collapsed "Activity Assignments" section
  await page
    .locator(".resource-list-toggle-link.collapsed", {
      hasText: "Activity Assignments"
    })
    .click()

  const resourceCard = page.locator(".resource-card", {
    has: page.locator(".resource-card-title", { hasText: "example_jpg.jpg" })
  })
  const titleLink = resourceCard.locator(".resource-card-title")
  const downloadLink = resourceCard.locator(".resource-card-thumbnail-link")

  const titleHref = await expectLocalPackageHref(titleLink)
  expect(titleHref).toContain("resources/example_jpg/index.html")

  const assetHref = await expectLocalPackageHref(downloadLink)
  expect(assetHref).toContain("static_resources/")
  expect(assetHref).toMatch(/\.jpg$/)
})
