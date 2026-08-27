import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"
import { VideoElement } from "../util/VideoElement"

test("Start and end times does not exist", async ({ page, siteAlias }) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v02_360p")
  if (siteAlias === "course-offline") {
    // Offline builds replace the YouTube player with an offline warning
    await expect(page.locator(".show-offline")).toBeVisible()
    return
  }
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")

  expect(src).not.toMatch(/.*?start=.*/)
  expect(src).not.toMatch(/.*?end=.*/)
})

test("Start time exists and transcript section can be expanded", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  if (siteAlias === "course-offline") {
    // Offline builds replace the YouTube player with an offline warning, and
    // the transcript-track JS that populates .transcript-line content isn't
    // in the offline bundle, so the rest of this test doesn't apply.
    await expect(page.locator(".show-offline")).toBeVisible()
    return
  }
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")
  expect(src).toMatch(/.*?start=13.*/)

  // Open the transcript tab and select the only language option.
  // The pane stays empty until a language is explicitly selected.
  const videoElement = new VideoElement(page)
  await videoElement.tab({ name: /Transcript/i, exact: false }).click()
  await page.waitForSelector(".video-tab.container.transcript.show", {
    state: "attached"
  })
  await page.locator(".transcript-lang-dropdown-btn").click()
  await page.locator(".transcript-lang-option").first().click()

  const transcriptLine = page.locator('.transcript-line[data-begin="12.06"]')
  await expect(transcriptLine).toContainText(
    "so here's our runner, and here's our road"
  )
})

test("End time exists", async ({ page, siteAlias }) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  if (siteAlias === "course-offline") {
    // Offline builds replace the YouTube player with an offline warning
    await expect(page.locator(".show-offline")).toBeVisible()
    return
  }
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")
  expect(src).toMatch(/.*?end=50.*/)
})

test("Start and end time exists", async ({ page, siteAlias }) => {
  const course = new CoursePage(page, siteAlias)
  const expectedStartTime = "13"
  const expectedEndTime = "50"

  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  if (siteAlias === "course-offline") {
    // Offline builds replace the YouTube player with an offline warning
    await expect(page.locator(".show-offline")).toBeVisible()
    return
  }
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")

  const urlParams = new URLSearchParams(src || "")
  expect(urlParams.get("start")).toEqual(expectedStartTime)
  expect(urlParams.get("end")).toEqual(expectedEndTime)
})
