import { test, expect } from "@playwright/test"
import { CoursePage, VideoElement } from "../util"

test("Start and end times does not exist", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v02_360p")
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")

  expect(src).not.toMatch(/.*?start=.*/)
  expect(src).not.toMatch(/.*?end=.*/)
})

test("Start time exists", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")
  expect(src).toMatch(/.*?start=13.*/)
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

test("Transcripts start time matches video start time", async ({ page }) => {
  const course = new CoursePage(page, "course")
  const videoSection = new VideoElement(page)
  const expectedStartTime = "13"

  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await videoSection.iframe().getAttribute("src")

  const urlParams = new URLSearchParams(src || "")
  expect(urlParams.get("start")).toEqual(expectedStartTime)

  await videoSection.expectPlayerReady()
  await page.waitForLoadState('networkidle')
  await videoSection.playButton().click({ force: true })

  const activeCaption = await videoSection.transcript
    .activeLine()
    .getAttribute("data-begin")
  const nextCaption = await videoSection.transcript
    .nextLine()
    .getAttribute("data-begin")

  expect(parseFloat(activeCaption || "0")).toBeLessThanOrEqual(
    parseFloat(expectedStartTime)
  )
  expect(parseFloat(nextCaption || "0")).toBeGreaterThanOrEqual(
    parseFloat(expectedStartTime)
  )
})
