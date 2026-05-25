import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

const FOOTER_LINKS = [
  ["Home", /^\/$/],
  ["About Us", /^\/about\/?$/],
  ["Accessibility", /^\/accessibility\/?$/],
  ["Terms of Service", /^\/terms\/?$/],
  ["Contact Us", /^https:\/\/mitocw\.zendesk\.com\//]
]

test("Footer links exist and point to the expected pages", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto()

  for (const [name, url] of FOOTER_LINKS) {
    const link = page
      .getByRole("contentinfo")
      .getByRole("link", { name, exact: true })
    await expect(link).toBeVisible()
    // Offline builds use relative or localhost URLs for internal footer links
    if (siteAlias !== "course-v3-offline") {
      await expect(link).toHaveAttribute("href", url)
    }
  }
})
