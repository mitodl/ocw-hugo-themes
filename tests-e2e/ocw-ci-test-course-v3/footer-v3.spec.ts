import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

const FOOTER_LINKS = [
  ["Home", /^\/$/],
  ["About Us", /^\/about\/?$/],
  ["Accessibility", /^\/accessibility\/?$/],
  ["Terms of Service", /^\/terms\/?$/],
  ["Contact Us", /^https:\/\/mitocw\.zendesk\.com\//]
]

test.beforeEach(({ siteAlias }) => {
  test.skip(
    siteAlias === "course-v3-offline",
    "Footer link hrefs are relative in offline builds; absolute path regex assertions do not apply"
  )
})

test("Footer links exist and point to the expected pages", async ({ page, siteAlias }) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto()

  for (const [name, url] of FOOTER_LINKS) {
    const link = page
      .getByRole("contentinfo")
      .getByRole("link", { name, exact: true })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute("href", url)
  }
})
