import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"
import { VideoElement } from "../util/VideoElement"

test("Verify that the 'Download video' and 'Download transcript' links are keyboard navigable and have the correct download URLs", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const downloadLinks = [
    "https://live-qa.ocw.mit.edu/courses/123-ocw-ci-test-course-fall-2022/ocw_test_course_mit8_01f16_l01v01_360p_360p_16_9.mp4",
    "https://live-qa.ocw.mit.edu"
  ]
  const downloadButton = page.getByRole("button", {
    name: `Download Video and Transcript`
  })
  await downloadButton.focus()
  await page.keyboard.press("Enter")

  const videoDownloadLink = page.getByRole("link", { name: "Download video" })
  const transcriptDownloadLink = page.getByRole("link", {
    name: "Download transcript"
  })
  const downloadLinksArr = [videoDownloadLink, transcriptDownloadLink]

  for (let i = 0; i < 2; i++) {
    await expect(downloadLinksArr[i]).toBeVisible()
    await page.keyboard.press("Tab")
    const hrefAttribute = await page.locator(":focus").getAttribute("href")
    expect(hrefAttribute).toBe(downloadLinks[i])
  }
})

test("Embed video redirects to video page using keyboard navigation", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("pages/video-series-overview/")
  const videoRedirectLink = page.getByRole("link", {
    name: "View video page"
  })
  await videoRedirectLink.focus()
  page.keyboard.press("Enter")
  await course.page.waitForURL(
    '**/resources/ocw_test_course_mit8_01f16_l01v01_360p/'
  )
  expect(course.page.url()).toContain(
    "resources/ocw_test_course_mit8_01f16_l01v01_360p"
  )
})
test("Video tabs content (links) are keyoard navigable", async ({ page }) => {
  const tabs = [
    {
      title:        "Related Resources",
      url:   "courses/ocw-ci-test-course/resources/example_pdf/"
    },
    {
      title:        "Optional Tab",
      url:   "courses/ocw-ci-test-course/resources/example_notes/"
    }
  ]
  for (const tab of tabs) {
    const course = new CoursePage(page, "course")
    await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
    const tabButton = page.getByRole("button", {
      name: `${tab.title}`
    })
    await tabButton.focus()
    page.keyboard.press("Enter")
    page.keyboard.press("Tab")
    page.keyboard.press("Enter")
    await course.page.waitForURL(
      `**/${tab.url}`
    )
    expect(course.page.url()).toContain(tab.url)
  }
})
test.only("Expand and collapse video tabs using keyboard navigation", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const video = new VideoElement(page)

  const tabClassToTitle: { [key: string]: string } = {
    transcript:         "Transcript",
    "related-resource": "Related Resources",
    "optional-tab":     "Optional Tab"
  }

  for (const [tabClass, tabTitle] of Object.entries(tabClassToTitle)) {
    const tabButton = page.getByRole("button", {
      name: `${tabTitle}`, exact: true
    })
    await expect(tabButton).toBeVisible()
    await tabButton.focus()

    await page.keyboard.press("Enter")
    expect(await video.tab({ name: `${tabTitle}`, expanded: true }).waitFor())

    await expect(
      page.locator(`.video-tab.container.${tabClass}.collapse`)
    ).toHaveClass(/show/)
    await page.keyboard.press("Enter")
    expect(await video.tab({ name: `${tabTitle}`, expanded: false }).waitFor())
  }
})
