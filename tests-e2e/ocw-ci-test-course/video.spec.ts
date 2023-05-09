import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

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
    name: `Download button`
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
  await course.page.waitForNavigation()
  expect(course.page.url()).toContain(
    "resources/ocw_test_course_mit8_01f16_l01v01_360p"
  )
})
test("Video tabs content (links) are keyoard navigable", async ({ page }) => {
  const tabDict: { [key: string]: { title: string; redirectPath: string } } = {
    "related-resource": {
      title:        "Related Resources",
      redirectPath: "courses/ocw-ci-test-course/resources/example_pdf/"
    },
    "optional-tab": {
      title:        "Optional Tab",
      redirectPath: "courses/ocw-ci-test-course/resources/example_notes/"
    }
  }
  for (const tabClass in tabDict) {
    if (tabClass) {
      const course = new CoursePage(page, "course")
      await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
      const tabTitle = tabDict[tabClass].title
      const tabButton = page.getByRole("button", {
        name: `${tabTitle}`
      })
      await tabButton.focus()
      page.keyboard.press("Enter")
      page.keyboard.press("Tab")
      page.keyboard.press("Enter")
      await course.page.waitForNavigation()
      expect(course.page.url()).toContain(tabDict[tabClass].redirectPath)
    }
  }
})
test("Expand and collapse video tabs using keyboard navigation", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")

  const tabClassToTitle: { [key: string]: string } = {
    transcript:         "Transcript",
    "related-resource": "Related Resources",
    "optional-tab":     "Optional Tab"
  }
  for (const tabClass in tabClassToTitle) {
    if (tabClass) {
      const title = tabClassToTitle[tabClass]
      const tabButton = page.getByRole("button", {
        name: `${title}`
      })
      await expect(tabButton).toBeVisible()
      await tabButton.focus()

      // Use keyboard to expand the tab
      page.keyboard.press("Enter")

      const toggleSection = await page.waitForSelector(
        `.video-tab-toggle-section[data-target=".${tabClass}"]`
      )
      await expect(
        page.locator(`.video-tab.container.${tabClass}.collapse`)
      ).toHaveClass(/show/)
      expect(
        await toggleSection.evaluate(toggle =>
          toggle.getAttribute("aria-expanded")
        )
      ).toBe("true")
      // Use keyboard to collapse the tab
      page.keyboard.press("Enter")
      await page.waitForFunction(toggleSection => {
        return toggleSection.getAttribute("aria-expanded") === "false"
      }, toggleSection)
      await page.waitForFunction(tabClass => {
        const tabContainer = document.querySelector(
          `.video-tab.container.${tabClass}.collapse`
        )
        return tabContainer && !tabContainer.classList.contains("show")
      }, tabClass)
    }
  }
})
