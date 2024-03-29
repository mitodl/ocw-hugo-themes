import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Collapsed description is inline and the button appears next to the text", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/")

  const description = await page.locator(
    "#collapsed-description p:last-of-type"
  )

  await expect(description).toHaveCSS("display", "inline")
})
