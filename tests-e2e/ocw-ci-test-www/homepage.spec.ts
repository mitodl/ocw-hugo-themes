import { test, expect } from "@playwright/test"
import { WwwPage, siteUrl } from "../util"

test("Home page has title in <head>", async ({ page }) => {
  await page.goto(siteUrl("www"))
  await expect(page).toHaveTitle(
    "MIT OpenCourseWare | Free Online Course Materials"
  )
})

test("Social links exist and open correct social media pages", async ({
  page
}) => {
  const SOCIAL_LINKS = [
    ["facebook", /https:\/\/www.facebook.com\/MITOCW\/?/],
    ["instagram", /https:\/\/www.instagram.com\/mitocw\/?/],
    ["twitter", /https:\/\/twitter.com\/MITOCW\/?/],
    ["youtube", /https:\/\/www.youtube.com\/mitocw\/?/],
    ["linkedin", /https:\/\/www.linkedin.com\/company\/mit-opencourseware\/?/]
  ]

  const www = new WwwPage(page)
  await www.goto()

  for (const [name, url] of SOCIAL_LINKS) {
    for (const location of [".social-icon-row", "#footer-container"]) {
      const popupPromise = page.waitForEvent("popup")

      const link = page
        .locator(location)
        .getByRole("link", { name, exact: true })
      await expect(link).toBeVisible()
      await link.click()

      const popup = await popupPromise
      await popup.waitForURL(url, { timeout: 10000, waitUntil: "commit" })
      await popup.close()
    }
  }
})
