import { env } from "../../env"
import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"
import { VideoElement } from "../util/VideoElement"

const resourceBaseUrl = env.RESOURCE_BASE_URL

test("that the Download Button works for multiple embed videos in a page", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto("pages/multiple-videos-series-overview/")
  const videoElementsCount = await new VideoElement(page).count()
  expect(videoElementsCount).toBe(3)

  for (let i = 0; i < videoElementsCount; i++) {
    const videoElement = new VideoElement(page, i)
    await videoElement.downloadButton().click()
    expect(videoElement.downloadVideo()).toHaveAttribute(
      "href",
      new URL(
        "/courses/ocw-ci-test-course/ocw_test_course_mit8_01f16_l01v01_360p_360p_16_9.mp4",
        resourceBaseUrl
      ).href
    )
    expect(videoElement.downloadTranscript()).toHaveAttribute(
      "href",
      new URL(
        "/courses/8-01sc-classical-mechanics-fall-2016/33f61131009a6cd12d9a4c0e42eb7f44_ErlP_SBcA1s.pdf",
        resourceBaseUrl
      ).href
    )
    await videoElement.downloadButton().click()
  }
})

test("Verify that the 'Download video' and 'Download transcript' links are keyboard navigable and have the correct download URLs", async ({
  page
}) => {
  /**
   * ALERT MAC USERS
   * =================
   * This test will only pass if MacOS System setting "Keyboard navigation" is
   * enabled. This setting is **disablled** by default.
   *
   * See https://github.com/mitodl/ocw-hugo-themes/issues/1283#issuecomment-1833883368
   * for more context.
   */
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const downloadLinks = [
    new URL(
      "/courses/ocw-ci-test-course/ocw_test_course_mit8_01f16_l01v01_360p_360p_16_9.mp4",
      resourceBaseUrl
    ).href,
    new URL(
      "/courses/8-01sc-classical-mechanics-fall-2016/33f61131009a6cd12d9a4c0e42eb7f44_ErlP_SBcA1s.pdf",
      resourceBaseUrl
    ).href
  ]
  const downloadButton = page.getByRole("button", {
    name: `Show Downloads`
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
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto("pages/video-series-overview/")
  const videoRedirectLink = page.getByRole("link", {
    name: "View video page"
  })
  await videoRedirectLink.focus()
  page.keyboard.press("Enter")
  await coursePage.page.waitForURL(
    "**/resources/ocw_test_course_mit8_01f16_l01v01_360p/"
  )
  expect(coursePage.page.url()).toContain(
    "resources/ocw_test_course_mit8_01f16_l01v01_360p"
  )
})
test("Video tabs content (links) are keyoard navigable", async ({ page }) => {
  const tabs = [
    {
      title: "Related Resources",
      url:   "courses/ocw-ci-test-course/resources/example_pdf/"
    },
    {
      title: "Optional Tab",
      url:   "courses/ocw-ci-test-course/resources/example_notes/"
    }
  ]
  for (const tab of tabs) {
    const coursePage = new CoursePage(page, "course")
    await coursePage.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
    const videoPage = new VideoElement(page)
    const tabButton = videoPage.tab({
      name: `${tab.title}`
    })
    await tabButton.focus()
    page.keyboard.press("Enter")
    await page.waitForSelector(".video-tab.container.show", {
      state: "visible"
    })
    page.keyboard.press("Tab")
    page.keyboard.press("Enter")
    await coursePage.page.waitForURL(`**/${tab.url}`)
    expect(coursePage.page.url()).toContain(tab.url)
  }
})
test("Expand and collapse video tabs using keyboard navigation", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const videoPage = new VideoElement(page)

  const tabClassToTitle: { [key: string]: string } = {
    transcript:         "Transcript",
    "related-resource": "Related Resources",
    "optional-tab":     "Optional Tab"
  }

  for (const [tabClass, tabTitle] of Object.entries(tabClassToTitle)) {
    const tabButton = videoPage.tab({
      name:  `${tabTitle}`,
      exact: true
    })
    await expect(tabButton).toBeVisible()
    await tabButton.focus()

    page.keyboard.press("Enter")
    expect(
      await videoPage.tab({ name: `${tabTitle}`, expanded: true }).waitFor()
    )
    // Wait for the tab to fully expand
    await expect(
      page.locator(`.video-tab.container.${tabClass}.collapse`)
    ).toHaveClass(/show/)
    // Collapse the tab
    page.keyboard.press("Enter")
    expect(
      await videoPage.tab({ name: `${tabTitle}`, expanded: false }).waitFor()
    )
  }
})

test("A page without a transcript has the proper tab titles and contents", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto("/resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const videoPage = new VideoElement(page)

  await expect(videoPage.tab({})).toHaveText([
    /Transcript/,
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
    '<a href="/courses/ocw-ci-test-course/resources/example_notes/">(PDF)</a>'
  )
})

test("A page with a transcript has a transcript tab", async ({ page }) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto("/resources/ocw_test_course_mit8_01f16_l01v02_360p")
  const videoPage = new VideoElement(page)
  await expect(videoPage.tab({})).toHaveText(/Transcript\s*/)
})
