import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"
import { SOCIAL_LINKS } from "../util/constants"

test("Social links exist and open correct social media pages", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto()

  for (const [name, url] of SOCIAL_LINKS) {
    const link = page
      .locator(".footer-main-content")
      .getByRole("link", { name, exact: true })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", url)
  }
})
