import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Resource links titles render without extra spaces", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/shortcode-demos")
  const resourceLink = page.getByRole("link", {
    name: "Resource link to First Test Page"
  })
  expect(await resourceLink.count()).toBe(1)
  const parentText = await resourceLink.evaluate(el =>
    el.closest("p")?.textContent?.trim()
  )
  expect(parentText).toBe(
    "Check no extra spaces xxxResource link to First Test Pagexxx"
  )
})

test("Resource links include link to correct page", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/shortcode-demos")
  const resourceLink = page.getByRole("link", {
    name: "Resource link to First Test Page"
  })
  const href = await resourceLink.getAttribute("href")
  expect(href).toBe("/courses/ocw-ci-test-course/pages/first-test-page-title/")
})

test("Related resources link to correct page", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const tab = page.getByText("Related Resources")
  await tab.click()
  const resourceLink = page.getByRole("link", {
    name: "(PDF)"
  })
  const href = await resourceLink.getAttribute("href")
  expect(href).toBe("/courses/ocw-ci-test-course/resources/example_pdf/")
})

test("Start and end times does not exist", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v02_360p")
  const src = await page.locator('iframe.vjs-tech').getAttribute('src')

  expect(src).not.toMatch(/.*?start=.*/)
  expect(src).not.toMatch(/.*?end=.*/)
})


test("Start time exists", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await page.locator('iframe.vjs-tech').getAttribute('src')
  expect(src).toMatch(/.*?start=13.*/)
})

test("End time exists", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await page.locator('iframe.vjs-tech').getAttribute('src')
  expect(src).toMatch(/.*?end=15.*/)
})

test("Start and end time exists", async ({ page }) => {
  const course = new CoursePage(page, "course")
  const expectedStartTime = '13'
  const expectedEndTime = '15'

  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await page.locator('iframe.vjs-tech').getAttribute('src')

  const urlParams = new URLSearchParams(src || '')
  expect(urlParams.get('start')).toEqual(expectedStartTime)
  expect(urlParams.get('end')).toEqual(expectedEndTime)
})

test("Transcripts start time matches video start time", async ({ page }) => {
  const course = new CoursePage(page, "course")
  const expectedStartTime = '13'

  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const src = await page.locator('iframe.vjs-tech').getAttribute('src')

  const urlParams = new URLSearchParams(src || '')
  expect(urlParams.get('start')).toEqual(expectedStartTime)

  const playButton = page.frameLocator('role=region[name="Video Player"] >> iframe').getByRole('button', { name: 'Play' })
  await page.waitForTimeout(1000)
  await playButton.click()

  const activeCaption = await page.locator('.transcript-line.is-active').getAttribute('data-begin')
  const nextCaption = await page.locator('.transcript-line.is-active + div').getAttribute('data-begin')

  expect(parseFloat(activeCaption || '0')).toBeLessThanOrEqual(parseFloat(expectedStartTime))
  expect(parseFloat(nextCaption || '0')).toBeGreaterThanOrEqual(parseFloat(expectedStartTime))
})
