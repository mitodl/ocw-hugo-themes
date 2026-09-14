import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

test("Image gallery displays thumbnail and opens viewer", async ({
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

test("Gallery data-base-url is package-appropriate", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/pages/image-gallery")

  const gallery = page.locator(".image-gallery[data-base-url]").first()
  await expect(gallery).toBeAttached()
  const baseUrl = await gallery.getAttribute("data-base-url")
  expect(baseUrl).not.toBeNull()

  if (siteAlias === "course-offline") {
    // Offline builds resolve gallery images from the package-local
    // static_resources directory, not an absolute URL.
    expect(baseUrl).not.toMatch(/^https?:\/\//)
    expect(baseUrl).not.toMatch(/^\//)
    expect(baseUrl).toContain("static_resources")
  }
})

test("Image gallery credit metadata contains external link warning markup", async ({
  page,
  request,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/pages/image-gallery")
  const response = await request.get(page.url())
  expect(response.ok()).toBeTruthy()

  const html = await response.text()
  expect(html).toContain('data-credit="Distributed under the CCC.')
  expect(html).toContain("external-link-warning external-link")
  expect(html).toContain("href=&#34;https://google.com&#34;")
  expect(html).toContain("Google (opens in a new tab)")
})
