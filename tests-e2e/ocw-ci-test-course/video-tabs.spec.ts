import { test, expect } from "@playwright/test"
import { VideoPage } from "../util/VideoPage"

test("A page without a transcript has the proper tab titles and contents", async ({
  page
}) => {
  const videoPage = new VideoPage(page)
  await videoPage.goto("/resources/ocw_test_course_mit8_01f16_l01v01_360p")

  await expect(videoPage.tabs).toHaveText([
    /\s*$/, // first tab is just download button with no title.
    /Related Resources/,
    /Optional Tab/
  ])

  const panels = await videoPage.tabPanels.all()
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
})

test("A page with a transcript has a transcript tab", async ({ page }) => {
  const videoPage = new VideoPage(page)
  await videoPage.goto("/resources/ocw_test_course_mit8_01f16_l01v02_360p")
  await expect(page.getByRole("tab")).toHaveText(["Transcript"])
})
