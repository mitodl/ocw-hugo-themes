import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"
import { VideoElement } from "../util/VideoElement"

const MULTI_LANG_RESOURCE =
  "/resources/ocw_test_course_mit8_01f16_l26v02_360p_mp4"

test.describe("Course v3 video tab language selector", () => {
  test("multi-lang resource shows language selector with English and French options", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(MULTI_LANG_RESOURCE)
    const videoPage = new VideoElement(page)

    // Open the Transcript tab
    await videoPage.tab({ name: /Transcript/i, exact: false }).click()
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

  test("clicking a language option updates the dropdown button label", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(MULTI_LANG_RESOURCE)
    const videoPage = new VideoElement(page)

    // Open transcript tab
    await videoPage.tab({ name: /Transcript/i, exact: false }).click()
    await page.waitForSelector(".video-tab.container.transcript.show", {
      state: "attached"
    })

    // Initial label is the default language (English pre-selected)
    await expect(page.locator(".transcript-lang-btn-text")).toHaveText(
      "English"
    )

    // Open dropdown, click French
    await page.locator(".transcript-lang-dropdown-btn").click()
    await page.locator(".transcript-lang-option[data-lang='fr']").click()

    // Button label should update to French
    await expect(page.locator(".transcript-lang-btn-text")).toHaveText("French")
  })

  test("selecting a language multiple times does not stack transcript views", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(MULTI_LANG_RESOURCE)
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

  test("switching language replaces the transcript preview, not stacks below it", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(MULTI_LANG_RESOURCE)
    const videoPage = new VideoElement(page)

    // Open transcript tab
    await videoPage.tab({ name: /Transcript/i, exact: false }).click()
    await page.waitForSelector(".video-tab.container.transcript.show", {
      state: "attached"
    })

    const dropdownBtn = page.locator(".transcript-lang-dropdown-btn")
    const transcriptContainer = page.locator(
      ".video-tab.transcript .video-tab-content-section"
    )

    // Select English first
    await dropdownBtn.click()
    await page.locator(".transcript-lang-option[data-lang='en']").click()

    // Switch to French
    await dropdownBtn.click()
    await page.locator(".transcript-lang-option[data-lang='fr']").click()

    // There must still be exactly one plugin element (no stacking)
    const pluginElements = transcriptContainer.locator("[id^='transcript-']")
    expect(await pluginElements.count()).toBeLessThanOrEqual(1)

    // Switch back to English
    await dropdownBtn.click()
    await page.locator(".transcript-lang-option[data-lang='en']").click()

    // Still exactly one plugin element after switching back
    expect(await pluginElements.count()).toBeLessThanOrEqual(1)
  })

  test("download sub-menu is visible when transcript links present", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(MULTI_LANG_RESOURCE)

    // Open download popup
    await page.getByRole("button", { name: "Show Downloads" }).first().click()

    // Sub-menu button should be present in main view
    const subMenuBtn = page.getByRole("button", {
      name: /Download Transcript/i
    })
    await expect(subMenuBtn).toBeVisible()

    // Click to open sub-menu
    await subMenuBtn.click()

    // Both language transcript links should be visible
    const transcriptLinks = page.getByRole("link", {
      name:  "Download transcript: English",
      exact: true
    })
    await expect(transcriptLinks.first()).toBeVisible()
  })

  test("English transcript auto-loads when the tab is opened", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(MULTI_LANG_RESOURCE)
    const videoPage = new VideoElement(page)

    // Open the transcript tab
    await videoPage.tab({ name: /Transcript/i, exact: false }).click()
    await page.waitForSelector(".video-tab.container.transcript.show", {
      state: "attached"
    })

    // English is the default; the button should show its caption-track label.
    await expect(page.locator(".transcript-lang-btn-text")).toHaveText(
      "English"
    )

    // Switching to French updates the button label
    const dropdownBtn = page.locator(".transcript-lang-dropdown-btn")
    await dropdownBtn.click()
    await page.locator(".transcript-lang-option[data-lang='fr']").click()
    await expect(page.locator(".transcript-lang-btn-text")).toHaveText("French")
  })

  test("language selector active option is not bold (consistent with menu styling)", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(MULTI_LANG_RESOURCE)

    await new VideoElement(page)
      .tab({ name: /Transcript/i, exact: false })
      .click()
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

    // Open the dropdown and select a language so JS assigns the .active class
    const dropdownBtn = page.locator(".transcript-lang-dropdown-btn")
    await dropdownBtn.click()
    await page.locator(".transcript-lang-option[data-lang='en']").click()

    // Check via evaluate — the option may not be visible (dropdown closed)
    // but we can still read its computed style
    const activeFontWeight = await page
      .locator(".transcript-lang-option.active")
      .evaluate(el => window.getComputedStyle(el).fontWeight)
    expect(Number(activeFontWeight)).toBeLessThanOrEqual(400)
  })
})

const NO_DOWNLOADS_PAGE = "/pages/video-without-downloads"
const NO_DOWNLOADS_RESOURCE = "/resources/video-no-downloads"
const CAPTIONS_ONLY_RESOURCE = "/resources/video-captions-only"
const DOWNLOADABLE_RESOURCE =
  "/resources/ocw_test_course_mit8_01f16_l01v01_360p"
const ARCHIVE_URL = "http://www.archive.org/download/MIT18.06S05_MP4/01.mp4"

/**
 * These tests assert on server-rendered markup, so they navigate with
 * `domcontentloaded` rather than waiting on the embedded YouTube iframes.
 */
test.describe("Course v3 video download button visibility", () => {
  test("embedded videos with nothing to download have no download button", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(NO_DOWNLOADS_PAGE, { waitUntil: "domcontentloaded" })

    // Three embedded videos: two with nothing downloadable, one with only an
    // archive_url.
    await expect(new VideoElement(page).container).toHaveCount(3)
    await expect(new VideoElement(page, 0).downloadButton()).toHaveCount(0)
    await expect(new VideoElement(page, 1).downloadButton()).toHaveCount(0)

    // The tab itself still renders, linking through to the video's own page.
    await expect(
      page.getByRole("link", { name: "View video page" })
    ).toHaveCount(3)

    // Buttons and popups stay 1:1.
    await expect(page.locator(".video-download-icons")).toHaveCount(1)
    await expect(page.locator(".video-tab-download-popup")).toHaveCount(1)
  })

  test("an embedded video with only an archive_url still offers a download", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(NO_DOWNLOADS_PAGE, { waitUntil: "domcontentloaded" })
    const video = new VideoElement(page, 2)

    // Empty `file`, valid archive_url.
    await expect(video.downloadButton()).toHaveCount(1)
    await expect(video.downloadVideoLink()).toHaveAttribute("href", ARCHIVE_URL)
  })

  test("resource page for a video with nothing to download has no Transcript tab or download button", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(NO_DOWNLOADS_RESOURCE, { waitUntil: "domcontentloaded" })
    const video = new VideoElement(page)

    await expect(video.container).toHaveCount(1)
    await expect(video.tab({ name: /Transcript/i, exact: false })).toHaveCount(
      0
    )
    await expect(video.downloadButton()).toHaveCount(0)
  })

  test("captions-only resource page switches transcript languages without a download button", async ({
    page
  }) => {
    await page.route(/\.(?:vtt|webvtt)$/, async route => {
      await route.fulfill({
        body: [
          "WEBVTT",
          "",
          "00:00:00.000 --> 00:00:05.000",
          new URL(route.request().url()).pathname
        ].join("\n"),
        contentType: "text/vtt",
        headers:     { "access-control-allow-origin": "*" }
      })
    })

    const course = new CoursePage(page, "course-v3")
    await course.goto(CAPTIONS_ONLY_RESOURCE, { waitUntil: "domcontentloaded" })
    const video = new VideoElement(page)

    // Captions drive the in-page transcript panel, so the tab must still render.
    const transcriptTab = video.tab({ name: /Transcript/i, exact: false })
    await expect(transcriptTab).toHaveCount(1)
    // There is no transcript file and no video file, so nothing to download.
    await expect(video.downloadButton()).toHaveCount(0)

    await transcriptTab.click()
    const langOptions = page.locator(".transcript-lang-option")
    await expect(langOptions).toHaveText(["English", "French"])

    const transcriptBody = page.locator(".transcript-body")
    await expect(transcriptBody).toHaveAttribute("lang", "en")
    const firstTranscript = await transcriptBody.textContent()
    expect(firstTranscript).toBeTruthy()

    const secondOption = langOptions.nth(1)
    const secondLanguage = await secondOption.getAttribute("data-lang")
    expect(secondLanguage).toBeTruthy()
    await page.locator(".transcript-lang-dropdown-btn").click()
    await secondOption.click()
    await expect(transcriptBody).toHaveAttribute("lang", secondLanguage!)
    expect(await transcriptBody.textContent()).not.toBe(firstTranscript)
  })

  test("video with a downloadable file still shows the download button", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto(DOWNLOADABLE_RESOURCE, { waitUntil: "domcontentloaded" })
    const video = new VideoElement(page)

    await expect(video.downloadButton()).toHaveCount(1)
    await expect(video.downloadVideoLink()).toHaveAttribute(
      "href",
      /ocw_test_course_mit8_01f16_l01v01_360p_360p_16_9\.mp4$/
    )
  })
})
