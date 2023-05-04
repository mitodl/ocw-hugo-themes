import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Course page has title in <head>", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/resources/ocw_test_course_mit8_01f16_l01v01_360p")
  await expect(page).toHaveTitle(
    "ocw_test_course_MIT8_01F16_L01v01_360p.mp4 | OCW CI Test Course | Physics | MIT OpenCourseWare"
  )
})

test("Expected expandable tabs are properly rendered", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const tabTitles = await page.locator("span.tab-title").allTextContents()
  expect(tabTitles).toStrictEqual([
    "Related Resources",
    "Optional Tab"
  ])
  const tabHTML = await (
    await page.locator("div.video-tab-content-section").all()
  ).map(async tabContents => await tabContents.innerHTML())
  const relatedResourcesHTML = await tabHTML[1]
  const optionalTabHTML = await tabHTML[2]
  expect(relatedResourcesHTML).toContain("Practice problems")
  expect(relatedResourcesHTML).toContain(
    '<a href="/courses/ocw-ci-test-course/resources/example_pdf/">(PDF)</a>'
  )
  expect(optionalTabHTML).toContain(
    '<a href="https://ocw.mit.edu" target="_blank" rel="noopener">OCW</a>'
  )
})
