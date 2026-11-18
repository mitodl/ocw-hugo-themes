import { test, expect } from "../util/fixtures"
import { siteUrl } from "../util"

test("course data.json has the course license", async ({
  request,
  siteAlias
}) => {
  const response = await request.get(siteUrl(siteAlias, "data.json"))
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data.license).toBe("https://en.wikipedia.org/wiki/All_rights_reserved")
  expect(data.content_licenses).toEqual([
    "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    "https://creativecommons.org/licenses/by-sa/4.0/",
    "https://creativecommons.org/licenses/by/4.0/",
    "https://en.wikipedia.org/wiki/All_rights_reserved"
  ])
})
