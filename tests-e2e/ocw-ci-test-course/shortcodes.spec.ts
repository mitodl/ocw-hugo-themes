import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

test("Resource links titles render without extra spaces", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
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

test("Resource links include link to correct page", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/pages/shortcode-demos")
  const resourceLink = page.getByRole("link", {
    name: "Resource link to First Test Page"
  })
  const href = await resourceLink.getAttribute("href")
  if (siteAlias === "course-offline") {
    // Offline builds use relative hrefs
    expect(href).toMatch(/pages\/first-test-page-title/)
    expect(href).not.toMatch(/^https?:\/\//)
    expect(href).not.toMatch(/^\/courses\//)
  } else {
    expect(href).toBe(
      "/courses/ocw-ci-test-course/pages/first-test-page-title/"
    )
  }
})

test("Related resources link to correct page", async ({ page, siteAlias }) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const tab = page.getByText("Related Resources")
  await tab.click()
  const resourceLink = page.getByRole("link", {
    name: "(PDF)"
  })
  const href = await resourceLink.getAttribute("href")
  if (siteAlias === "course-offline") {
    // Offline builds use relative hrefs
    expect(href).toMatch(/resources\/example_pdf/)
    expect(href).not.toMatch(/^\/courses\//)
  } else {
    expect(href).toBe("/courses/ocw-ci-test-course/resources/example_pdf/")
  }
})
