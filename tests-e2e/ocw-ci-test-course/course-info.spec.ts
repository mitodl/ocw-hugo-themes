import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

const DESKTOP_COURSE_DRAWER_ID = "desktop-course-drawer"
const MAIN_COURSE_SECTION_ID = "main-course-section"

test("Course info section can be toggled", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/section-1")

  const heading = await page.getByRole("heading", { name: "Course Info" })
  const button = await page.getByRole("button", { name: "Course Info" })

  await expect(heading).toBeVisible()
  await button.click()
  await expect(heading).toBeHidden()
  await button.click()
  await expect(heading).toBeVisible()
})

test("Toggling topics does not affect drawer layout", async ({page}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/section-1")

  const heading = await page.getByRole("heading", { name: "Course Info" })
  const topicCollapseButton = await page.getByRole('button', { name: 'Engineering subtopics' })

  await expect(heading).toBeVisible()
  await expect(topicCollapseButton).toHaveAttribute("aria-expanded", "true")
  
  await topicCollapseButton.click()
  const mainSection = await page.locator(`#${MAIN_COURSE_SECTION_ID}`)
  const drawer = await page.locator(`#${DESKTOP_COURSE_DRAWER_ID}`)

  await expect(mainSection).toHaveClass(/.*col-lg-9.*/)
  await expect(drawer).toHaveClass(/.*col-3.*/)  
})
