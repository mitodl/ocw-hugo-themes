import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Resource links titles render without extra spaces", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/shortcode-demos")
  const resourceLink = page.getByRole("link", {
    name: "Resource link to First Test Page"
  })
  expect(await resourceLink.count()).toBe(1)
  const parentText = await resourceLink.evaluate(el =>
    el.closest("p")?.textContent?.trim()
  )
  expect(parentText).toBe(
    "Check no extra spaces xxxResource link to First Test Pagexxx"
  )
})

test("Resource links include link to correct page", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/shortcode-demos")
  const resourceLink = page.getByRole("link", {
    name: "Resource link to First Test Page"
  })
  const href = await resourceLink.getAttribute("href")
  expect(href).toBe("/courses/ocw-ci-test-course/pages/first-test-page-title/")
  expect(1).toBe(2)
})
