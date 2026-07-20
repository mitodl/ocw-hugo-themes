import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Mobile Course Info drawer", () => {
  test("Toggle button is absent on the home page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    await expect(page.locator("#mobile-course-info-toggle")).toHaveCount(0)
  })

  test("Toggle button opens the drawer on mobile viewports", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    const drawer = page.locator("#course-info-drawer")

    await expect(toggle).toBeVisible()
    await expect(drawer).not.toHaveClass(/\bin\b/)

    await toggle.click()

    await expect(drawer).toHaveClass(/\bin\b/)
    await expect(
      drawer.getByRole("heading", { name: "Course Info" })
    ).toBeVisible()
  })

  test("Close button closes the drawer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    const drawer = page.locator("#course-info-drawer")

    await toggle.click()
    await expect(drawer).toHaveClass(/\bin\b/)

    const closeButton = page.locator("#close-mobile-course-info-button")
    await closeButton.click()

    await expect(drawer).not.toHaveClass(/\bin\b/)
  })

  test("Toggle button is hidden on desktop viewports", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const toggle = page.locator("#mobile-course-info-toggle")
    await expect(toggle).toBeHidden()
  })

  test("Download button is removed from the mobile drawer but stays elsewhere on the page", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    // Bottom-of-page button + desktop drawer's own copy, both untouched by this task.
    await expect(page.locator(".download-course-button-v3")).toHaveCount(2)

    const toggle = page.locator("#mobile-course-info-toggle")
    await toggle.click()

    const drawer = page.locator("#course-info-drawer")
    await expect(drawer).toHaveClass(/\bin\b/)
    await expect(drawer.locator(".download-course-button-v3")).toHaveCount(0)
    await expect(page.locator(".download-course-button-v3")).toHaveCount(2)
  })
})
