import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

const offlineCourse = (page: Parameters<typeof test>[0]["page"]) =>
  new CoursePage(page, "course-v3-offline")

test("offline-v3 home page loads offline-v3 assets", async ({ page }) => {
  const course = offlineCourse(page)
  const response = await course.goto("/")

  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveURL(/ocw-ci-test-course-v3-offline\/?$/)
  await expect(page.locator("body")).toContainText("OCW CI Test Course")
  await expect(page.locator('link[href*="course_offline_v3"]')).toHaveCount(1)
  await expect(page.locator('script[src*="course_offline_v3"]')).toHaveCount(1)
})

test("offline-v3 generic page loads", async ({ page }) => {
  const course = offlineCourse(page)
  const response = await course.goto("/pages/assignments")

  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveURL(
    /ocw-ci-test-course-v3-offline\/pages\/assignments\/?$/
  )
  await expect(page.locator("body")).toContainText("Section 2")
})

test("offline-v3 resource list page loads", async ({ page }) => {
  const course = offlineCourse(page)
  const response = await course.goto("/lists/a-resource-list")

  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveURL(
    /ocw-ci-test-course-v3-offline\/lists\/a-resource-list\/?$/
  )
  await expect(page.locator("body")).toContainText("A resource list")
})

test("offline-v3 resource page loads", async ({ page }) => {
  const course = offlineCourse(page)
  const response = await course.goto("/resources/file_pdf")

  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveURL(
    /ocw-ci-test-course-v3-offline\/resources\/file_pdf\/?$/
  )
  await expect(page.locator("body")).toContainText("file.pdf")
})
