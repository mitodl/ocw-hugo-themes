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
    await videoElement.downloadTranscriptSubmenuBtn().click()
    await expect(videoElement.downloadTranscript()).toHaveAttribute(
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
   * enabled. This setting is **disabled** by default.
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
  const transcriptSubmenuBtn = page.getByRole("button", {
    name: /Download Transcript/i
  })

  await expect(videoDownloadLink).toBeVisible()
  await page.keyboard.press("Tab")
  const videoHref = await page.locator(":focus").getAttribute("href")
  expect(videoHref).toBe(downloadLinks[0])

  // Navigate into transcript sub-menu
  await expect(transcriptSubmenuBtn).toBeVisible()
  await page.keyboard.press("Tab")
  await page.keyboard.press("Enter")

  const transcriptDownloadLink = page.getByRole("link", {
    name: /Transcript \(PDF\)/i
  })
  await expect(transcriptDownloadLink).toBeVisible()
  // Skip Back button, tab to the first transcript link
  await page.keyboard.press("Tab")
  await page.keyboard.press("Tab")
  const transcriptHref = await page.locator(":focus").getAttribute("href")
  expect(transcriptHref).toBe(downloadLinks[1])
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

test("Multi-lang resource shows language selector with English and French options", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto(
    "/resources/ocw_test_course_mit8_01f16_l26v02_360p_mp4"
  )
  const videoPage = new VideoElement(page)

  // Open the Transcript tab
  const transcriptTab = videoPage.tab({ name: /Transcript/i, exact: false })
  await transcriptTab.click()
  await page.waitForSelector(".video-tab.container.transcript.show", {
    state: "attached"
  })

  // Language selector bar should be visible
  const langBar = page.locator(".transcript-lang-bar")
  await expect(langBar).toBeVisible()

  // Both language options should be present
  const langOptions = page.locator(".transcript-lang-option")
  await expect(langOptions).toHaveCount(2)
  await expect(langOptions.nth(0)).toHaveText("English")
  await expect(langOptions.nth(1)).toHaveText("French")
})

test("Clicking a language option updates the dropdown button label", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto(
    "/resources/ocw_test_course_mit8_01f16_l26v02_360p_mp4"
  )
  const videoPage = new VideoElement(page)

  // Open transcript tab
  await videoPage.tab({ name: /Transcript/i, exact: false }).click()
  await page.waitForSelector(".video-tab.container.transcript.show", {
    state: "attached"
  })

  // Initial label is the placeholder before any selection
  const dropdownBtn = page.locator(".transcript-lang-dropdown-btn")
  await expect(page.locator(".transcript-lang-btn-text")).toHaveText("----")

  // Initial label should be the placeholder
  await expect(page.locator(".transcript-lang-btn-text")).toHaveText("----")

  // Open dropdown, click French
  await dropdownBtn.click()
  await page.locator(".transcript-lang-option[data-lang='fr']").click()

  // Button label should update
  await expect(page.locator(".transcript-lang-btn-text")).toHaveText("French")
})

test("Selecting a language multiple times does not stack transcript views", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto(
    "/resources/ocw_test_course_mit8_01f16_l26v02_360p_mp4"
  )
  const videoPage = new VideoElement(page)

  // Open transcript tab
  await videoPage.tab({ name: /Transcript/i, exact: false }).click()
  await page.waitForSelector(".video-tab.container.transcript.show", {
    state: "attached"
  })

  // Click between languages several times
  const dropdownBtn = page.locator(".transcript-lang-dropdown-btn")
  for (let i = 0; i < 3; i++) {
    await dropdownBtn.click()
    await page.locator(".transcript-lang-option[data-lang='fr']").click()
    await dropdownBtn.click()
    await page.locator(".transcript-lang-option[data-lang='en']").click()
  }

  // There should be at most one transcript plugin element in the container
  const transcriptContainer = page.locator(
    ".video-tab.transcript .video-tab-content-section"
  )
  const pluginElements = transcriptContainer.locator("[id^='transcript-']")
  expect(await pluginElements.count()).toBeLessThanOrEqual(1)
})

test("Download sub-menu width matches main menu for multi-lang resource", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto(
    "/resources/ocw_test_course_mit8_01f16_l26v02_360p_mp4"
  )

  // Open the download popup
  const downloadBtn = page.getByRole("button", { name: "Show Downloads" })
  await downloadBtn.click()

  const popup = page.locator(".video-tab-download-popup").first()
  const mainMenu = popup.locator(".download-menu-main")
  const subMenu = popup.locator(".download-menu-submenu")

  const mainWidth = await mainMenu.evaluate(el => el.offsetWidth)

  // Navigate to sub-menu
  await page.getByRole("button", { name: /Download Transcript/i }).click()
  const subWidth = await subMenu.evaluate(el => el.offsetWidth)

  // Both views should have the same width (both set to width: 100%)
  expect(subWidth).toBe(mainWidth)
})

test("Transcript pane is empty until a language is selected", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto(
    "/resources/ocw_test_course_mit8_01f16_l26v02_360p_mp4"
  )
  const videoPage = new VideoElement(page)

  // Open the transcript tab
  await videoPage.tab({ name: /Transcript/i, exact: false }).click()
  await page.waitForSelector(".video-tab.container.transcript.show", {
    state: "attached"
  })

  // No transcript plugin element should be present before selecting a language
  const transcriptPlugin = page.locator(
    ".video-tab.transcript .video-tab-content-section [id^='transcript-']"
  )
  await expect(transcriptPlugin).toHaveCount(0)

  // After selecting a language, the transcript should appear
  const dropdownBtn = page.locator(".transcript-lang-dropdown-btn")
  await dropdownBtn.click()
  await page.locator(".transcript-lang-option[data-lang='en']").click()
  await expect(transcriptPlugin).toBeVisible()
})

test("Language selector active option is not bold (consistent with menu styling)", async ({
  page
}) => {
  const coursePage = new CoursePage(page, "course")
  await coursePage.goto(
    "/resources/ocw_test_course_mit8_01f16_l26v02_360p_mp4"
  )

  await new VideoElement(page).tab({ name: /Transcript/i, exact: false }).click()
  await page.waitForSelector(".video-tab.container.transcript.show", {
    state: "attached"
  })

  // The "Select language:" label should not be bold
  const label = page.locator(".transcript-lang-label")
  await expect(label).toBeVisible()
  const labelFontWeight = await label.evaluate(
    el => window.getComputedStyle(el).fontWeight
  )
  expect(Number(labelFontWeight)).toBeLessThanOrEqual(400)

  // The active language option should not be bold either
  const activeOption = page.locator(".transcript-lang-option.active")
  await expect(activeOption).toBeVisible()
  const activeFontWeight = await activeOption.evaluate(
    el => window.getComputedStyle(el).fontWeight
  )
  expect(Number(activeFontWeight)).toBeLessThanOrEqual(400)
})
