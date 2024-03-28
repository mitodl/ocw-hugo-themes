import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("homepage visuals", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/")
  await expect(page).toHaveScreenshot()
})
