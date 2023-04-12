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
})

test("Related resources link to correct page", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const tab = page.getByText("Related Resources")
  await tab.click()
  const resourceLink = page.getByRole("link", {
    name: "(PDF)"
  })
  const href = await resourceLink.getAttribute("href")
  expect(href).toBe("/courses/ocw-ci-test-course/resources/example_pdf/")
})
