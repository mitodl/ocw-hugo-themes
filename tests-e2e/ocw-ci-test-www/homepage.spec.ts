import { test, expect } from "@playwright/test"
import { siteUrl } from "../util"

test("Course page have title in <head>", async ({ page }) => {
  await page.goto(siteUrl("www"))
  await expect(page).toHaveTitle(
    "MIT OpenCourseWare | Free Online Course Materials"
  )
})
