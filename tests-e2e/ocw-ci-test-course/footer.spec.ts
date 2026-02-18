import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

const FOOTER_LINKS = [
  ["Home", /^\/$/],
  ["About Us", /^\/about\/?$/],
  ["Accessibility", /^\/accessibility\/?$/],
  ["Terms of Service", /^\/terms\/?$/],
  ["Contact Us", /^\/contact\/?$/]
]

test("Footer links exist and point to the expected pages", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto()

  for (const [name, url] of FOOTER_LINKS) {
    const link = page
      .getByRole("contentinfo")
      .getByRole("link", { name, exact: true })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", url)
  }
})
