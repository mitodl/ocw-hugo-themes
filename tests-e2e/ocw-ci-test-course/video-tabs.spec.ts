import { test, expect } from "@playwright/test"
import { VideoElement } from "../util/VideoElement"
import { CoursePage } from "../util"

test("A page without a transcript has the proper tab titles and contents", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto("/resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const videoPage = new VideoElement(page)

  await expect(videoPage.tab({})).toHaveText([
    /\s*$/, // first tab is just download button with no title.
    /Related Resources/,
    /Optional Tab/
  ])

  const panels = await videoPage.tabPanel({ includeHidden: true }).all()
  const html = await Promise.all(panels.map(panel => panel.innerHTML()))

  expect(html).toHaveLength(3)

  const emptyTabHTML = html[0]
  const relatedResourcesHTML = html[1]
  const optionalTabHTML = html[2]

  expect(emptyTabHTML).toMatch("")
  expect(relatedResourcesHTML).toContain("Practice problems")
  expect(relatedResourcesHTML).toContain(
    '<a href="/courses/ocw-ci-test-course/resources/example_pdf/">(PDF)</a>'
  )
  expect(optionalTabHTML).toContain(
    '<a href="https://ocw.mit.edu" target="_blank" rel="noopener">OCW</a>'
  )
})

test("A page with a transcript has a transcript tab", async ({ page }) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto("/resources/ocw_test_course_mit8_01f16_l01v02_360p")
  const videoPage = new VideoElement(page)
  await expect(videoPage.tab({})).toHaveText(["Transcript"])
})
