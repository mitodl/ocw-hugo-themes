import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Download button links (download video and download transcript) should be keyboard navigable", async ({
  page,
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const downloadButtonByRole = page.getByRole("button", {
    name: (`Download Button`),
  })
  await downloadButtonByRole.focus()
  await page.keyboard.press("Enter")

  const videoLink = page.getByRole("link", { name: "Download video" })

  await expect(videoLink).toBeVisible()

  const transcriptLink = page.getByRole("link", { name: "Download transcript" })
  await expect(transcriptLink).toBeVisible()

  await page.keyboard.press("Tab")
  await expect(videoLink).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(transcriptLink).toBeFocused()

  // Add back in any href tests you want on the links
})

test("Embed video redirects to video page using keyboard navigation", async ({
  page,
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("pages/video-series-overview/")
  const videoRedirectLink = page.getByRole("link", {
    name: "keyboard_arrow_right View video page",
  })
  await videoRedirectLink.focus()
  page.keyboard.press("Enter")
  await course.page.waitForNavigation()
  expect(course.page.url()).toContain("resources/ocw_test_course_mit8_01f16_l01v01_360p")
})
test("Video tabs content (links) are navigable using keyboard", async ({
  page,
}) => {
  const tabDict: { [key: string]: { title: string; redirectPath: string } } = {
    "related-resource": { title: "Related Resources", redirectPath: "courses/ocw-ci-test-course/resources/example_pdf/" },
    "optional-tab":      { title: "Optional Tab", redirectPath: "courses/ocw-ci-test-course/resources/example_notes/" },
  }
  for (const tabClass in tabDict) {
    if (tabClass) {
      const course = new CoursePage(page, "course")
      await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
      const title = tabDict[tabClass].title
      const tabByRole = page.getByRole("button", {
        name: (`keyboard_arrow_right ${title}`),
      })
      await tabByRole.focus()
      // Use keyboard to expand the tab
      page.keyboard.press("Enter")
      page.keyboard.press("Tab")
      page.keyboard.press("Enter")
      await course.page.waitForNavigation()
      expect(course.page.url()).toContain(tabDict[tabClass].redirectPath)
    }
  }
})
test("Expand/collapse video tabs using keyboard", async ({
  page,
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")

  const tabClassToTitle: { [key: string]: string } = {
    transcript:          "Transcript",
    "related-resource": "Related Resources",
    "optional-tab":      "Optional Tab",
  }
  for (const tabClass in tabClassToTitle) {
    if (tabClass) {
      const title = tabClassToTitle[tabClass]
      const tabByRole = page.getByRole("button", {
        name: (`keyboard_arrow_right ${title}`),
      })
      await tabByRole.focus()
      // Use keyboard to expand the tab
      page.keyboard.press("Enter")
      const toggleButton = await page.waitForSelector(`.video-tab-toggle-section[data-target=".${tabClass}"]`)
      await expect(page.locator(`.video-tab.container.${tabClass}.collapse`)).toHaveClass(/show/)
      expect(
        await toggleButton.evaluate(tab => tab.getAttribute("aria-expanded"))
      ).toBe("true")
      // Use keyboard to collapse the tab
      page.keyboard.press("Enter")
      expect(
        await toggleButton.evaluate(tab => tab.getAttribute("aria-expanded"))
      ).toBe("false")
      await expect(page.locator(`.video-tab.container.${tabClass}.collapse`)).not.toHaveClass(/show/)
    }
  }
})
