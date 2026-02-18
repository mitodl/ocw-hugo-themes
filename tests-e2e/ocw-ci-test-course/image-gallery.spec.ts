import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Image gallery displays thumbnail and opens viewer", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/image-gallery")

  const thumbnailTitle = page.getByText("A dog having fun")
  await expect(thumbnailTitle).toBeVisible()

  await thumbnailTitle.click()

  const viewer = page.locator(".nGY2Viewer")
  await expect(viewer).toBeVisible()
})

test("Image gallery credit metadata contains external link warning markup", async ({
  page,
  request
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/image-gallery")
  const response = await request.get(page.url())
  expect(response.ok()).toBeTruthy()

  const html = await response.text()
  expect(html).toContain('data-credit="Distributed under the CCC.')
  expect(html).toContain("external-link-warning external-link")
  expect(html).toContain("href=&#34;https://google.com&#34;")
  expect(html).toContain("Google (opens in a new tab)")
})
