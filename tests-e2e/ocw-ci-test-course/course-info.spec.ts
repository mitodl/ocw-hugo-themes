import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

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
