import { test, expect } from "@playwright/test"
import { CoursePage, offlineV3FileUrl } from "../util"

const cases = {
  fall:                   "6.001+fall_2024",
  "january-iap":          "6.001+january-iap_2024",
  "without-term":         "6.001_2024",
  "without-year":         "6.001+fall",
  "without-term-or-year": "6.001"
}

test("course-v3 canonicalizes readable IDs", async ({ page }) => {
  const course = new CoursePage(page, "course-v3")
  await course.goto("/pages/readable-id-cases")

  for (const [name, readableId] of Object.entries(cases)) {
    await expect(
      page.locator(`[data-readable-id-case="${name}"]`)
    ).toHaveAttribute("data-readable-id", readableId)
  }
})

test("course-v3 bookmark markup uses the canonical readable ID", async ({
  page
}) => {
  const course = new CoursePage(page, "course-v3")
  await course.goto("/")

  const bookmarkContainer = page.locator(".bookmark-button-container")
  await expect(bookmarkContainer).toHaveCount(1)
  await expect(bookmarkContainer).toHaveAttribute(
    "data-resourcereadableid",
    "123+fall_2022"
  )
})

test("course-offline-v3 bookmark markup uses the canonical readable ID", async ({
  page
}) => {
  await page.goto(offlineV3FileUrl("/"))

  const bookmarkContainer = page.locator(".bookmark-button-container")
  await expect(bookmarkContainer).toHaveCount(1)
  await expect(bookmarkContainer).toHaveAttribute(
    "data-resourcereadableid",
    "123+fall_2022"
  )
})
