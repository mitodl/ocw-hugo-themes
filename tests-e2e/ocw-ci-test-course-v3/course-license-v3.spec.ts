import { test, expect } from "../util/fixtures"
import { CoursePage, siteUrl } from "../util"

const BY = "https://creativecommons.org/licenses/by/4.0/"
const BY_NC = "https://creativecommons.org/licenses/by-nc/4.0/"
const BY_NC_SA = "https://creativecommons.org/licenses/by-nc-sa/4.0/"
const BY_SA = "https://creativecommons.org/licenses/by-sa/4.0/"
const PUBLIC_DOMAIN = "https://creativecommons.org/publicdomain/zero/1.0/"
const ALL_RIGHTS_RESERVED = "https://en.wikipedia.org/wiki/All_rights_reserved"

const cases = {
  "default-only":                  BY_NC_SA,
  missing:                         BY_NC_SA,
  "less-restrictive-with-default": BY_NC_SA,
  "sa-then-nc":                    BY_NC_SA,
  "nc-then-sa":                    BY_NC_SA,
  "by-and-nc":                     BY_NC,
  "public-domain-and-by":          BY,
  "public-domain-only":            PUBLIC_DOMAIN,
  "all-rights-reserved":           ALL_RIGHTS_RESERVED,
  "unrecognized-cc":               BY_NC_SA,
  unknown:                         BY_NC_SA
}

test("the most restrictive license is chosen", async ({ page, siteAlias }) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/pages/license-cases")

  for (const [name, license] of Object.entries(cases)) {
    await expect(page.locator(`[data-license-case="${name}"]`)).toHaveAttribute(
      "data-license",
      license
    )
  }
})

test("course data.json has the course license", async ({
  request,
  siteAlias
}) => {
  const response = await request.get(siteUrl(siteAlias, "data.json"))
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data.license).toBe(ALL_RIGHTS_RESERVED)
  expect(data.content_licenses).toEqual([
    BY_NC_SA,
    BY_SA,
    BY,
    ALL_RIGHTS_RESERVED
  ])
})

test("Course Info shows the course license", async ({ page, siteAlias }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const course = new CoursePage(page, siteAlias)
  await course.goto("/resources/file_pdf")

  const heading = page
    .locator("#desktop-course-drawer")
    .getByRole("heading", { name: "Course License", exact: true })
  await expect(heading).toBeVisible()
  const value = heading.locator("xpath=following-sibling::div[1]")
  await expect(value).toHaveText("All Rights Reserved")
  await expect(value.getByRole("link")).toHaveCount(0)
})

test("Course Home shows the course license", async ({ page, siteAlias }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const course = new CoursePage(page, siteAlias)
  await course.goto()

  const heading = page
    .locator("#course-content-section")
    .getByRole("heading", { name: "Course License", exact: true })
  await expect(heading).toBeVisible()
  await expect(heading.locator("xpath=following-sibling::div[1]")).toHaveText(
    "All Rights Reserved"
  )
})
