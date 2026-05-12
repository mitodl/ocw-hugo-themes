import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"
import { VideoElement } from "../util/VideoElement"

test("Start and end times does not exist", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v02_360p")
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")

  expect(src).not.toMatch(/.*?start=.*/)
  expect(src).not.toMatch(/.*?end=.*/)
})

test("Start time exists and transcript section can be expanded", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")
  expect(src).toMatch(/.*?start=13.*/)

  // Open the transcript tab. For single-lang resources the plugin auto-mounts
  // on player ready, so the lines are already in the DOM.
  const videoElement = new VideoElement(page)
  await videoElement.tab({ name: /Transcript/i, exact: false }).click()
  await page.waitForSelector(".video-tab.container.transcript.show", {
    state: "attached"
  })

  const transcriptLine = page.locator('.transcript-line[data-begin="12.06"]')
  await expect(transcriptLine).toContainText(
    "so here's our runner, and here's our road"
  )
})

test("End time exists", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")
  expect(src).toMatch(/.*?end=50.*/)
})

test("Start and end time exists", async ({ page }) => {
  const course = new CoursePage(page, "course")
  const expectedStartTime = "13"
  const expectedEndTime = "50"

  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")

  const urlParams = new URLSearchParams(src || "")
  expect(urlParams.get("start")).toEqual(expectedStartTime)
  expect(urlParams.get("end")).toEqual(expectedEndTime)
})
