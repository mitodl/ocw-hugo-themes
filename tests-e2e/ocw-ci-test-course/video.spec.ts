import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Course page has title in <head>", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/resources/ocw_test_course_mit8_01f16_l01v01_360p")

  await expect(page.getByRole("tab")).toHaveText([
    /Related Resources/,
    /Optional Tab/
  ])

  const panels = await page.getByRole("tabpanel", { includeHidden: true }).all()
  const html = await Promise.all(panels.map(panel => panel.innerHTML()))

  expect(html).toHaveLength(3)

  const relatedResourcesHTML = html[1]
  const optionalTabHTML = html[2]

  expect(relatedResourcesHTML).toContain("Practice problems")
  expect(relatedResourcesHTML).toContain(
    '<a href="/courses/ocw-ci-test-course/resources/example_pdf/">(PDF)</a>'
  )
  expect(optionalTabHTML).toContain(
    '<a href="https://ocw.mit.edu" target="_blank" rel="noopener">OCW</a>'
  )
  await course.goto("/resources/ocw_test_course_mit8_01f16_l01v02_360p")
  await expect(page.getByRole("tab")).toHaveText(["Transcript"])
})
