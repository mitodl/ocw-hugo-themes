import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

test("Collapsed description is inline and the button appears next to the text", async ({
  page,
  siteAlias
}) => {
  const course = new CoursePage(page, siteAlias)
  await course.goto("/")

  const description = await page.locator(
    "#collapsed-description p:last-of-type"
  )

  await expect(description).toHaveCSS("display", "inline")
})
