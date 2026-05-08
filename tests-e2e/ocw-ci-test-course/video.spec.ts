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
  const videoElement = new VideoElement(page)
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await page.locator("iframe.vjs-tech").getAttribute("src")
  expect(src).toMatch(/.*?start=13.*/)

  await videoElement.tab({ name: "Transcript", exact: true }).click()
  await expect(
    videoElement.tab({ name: "Transcript", expanded: true, exact: true })
  ).toBeVisible()
  await videoElement.downloadButton().click()
  await expect(videoElement.downloadTranscript()).toBeVisible()
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
