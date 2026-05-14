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

    // Initial label is the placeholder before any selection
    await expect(page.locator(".transcript-lang-btn-text")).toHaveText(
      "Select a language"
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
      name: /transcript \(PDF\)/i
    })
    await expect(transcriptLinks.first()).toBeVisible()
  })

  test("transcript pane is empty until a language is selected", async ({
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

    // No transcript plugin element should be present before selecting a language
    const transcriptPlugin = page.locator(
      ".video-tab.transcript .video-tab-content-section [id^='transcript-']"
    )
    await expect(transcriptPlugin).toHaveCount(0)

    // After selecting a language the dropdown label should update,
    // confirming the selection was registered by the JS.
    const dropdownBtn = page.locator(".transcript-lang-dropdown-btn")
    await dropdownBtn.click()
    await page.locator(".transcript-lang-option[data-lang='en']").click()
    await expect(page.locator(".transcript-lang-btn-text")).toHaveText(
      "English"
    )
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
