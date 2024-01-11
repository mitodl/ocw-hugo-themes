import { test, expect } from "@playwright/test"
import { WwwPage, siteUrl } from "../util"
import { SOCIAL_LINKS } from "../util/constants"

test("Home page has title in <head>", async ({ page }) => {
  await page.goto(siteUrl("www"))
  await expect(page).toHaveTitle(
    "MIT OpenCourseWare | Free Online Course Materials"
  )
})

test("Social links exist and open correct social media pages", async ({
  page
}) => {
  const www = new WwwPage(page)
  await www.goto()

  for (const [name, url] of SOCIAL_LINKS) {
    for (const location of [".social-icon-row", "#footer-container"]) {
      const link = page
        .locator(location)
        .getByRole("link", { name, exact: true })
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute("href", url)
    }
  }
})
