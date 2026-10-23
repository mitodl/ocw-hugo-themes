import { test, expect } from "@playwright/test"
import { siteUrl } from "../util/test_sites"
import { env } from "../../env"

const learnHomeUrl = new URL("/", env.MIT_LEARN_BASE_URL).href
const learnSearchUrl = new URL("/search/", learnHomeUrl).href

test.use({ javaScriptEnabled: false })

test("the landing page respects NOINDEX", async ({ page }) => {
  await page.goto(siteUrl("ocw-transition"))

  const robots = page.locator('meta[name="robots"]')
  if (env.NOINDEX) {
    await expect(robots).toHaveAttribute("content", "noindex")
  } else {
    await expect(robots).toHaveCount(0)
  }
})

test("search submits the query to Learn with free OCW and MITx filters", async ({
  page
}) => {
  await page.route(`${learnSearchUrl}**`, route =>
    route.fulfill({ contentType: "text/html", body: "<title>Search</title>" })
  )
  await page.goto(siteUrl("ocw-transition"))

  const search = page.getByRole("search")
  const query = "linear algebra & differential equations"
  const input = search.locator('input[name="q"]')
  await input.fill(query)

  const requestPromise = page.waitForRequest(request =>
    request.url().startsWith(learnSearchUrl)
  )
  await input.press("Enter")
  const request = await requestPromise
  const url = new URL(request.url())

  expect(request.method()).toBe("GET")
  expect(url.pathname).toBe("/search/")
  expect(url.searchParams.get("q")).toBe(query)
  expect(url.searchParams.get("free")).toBe("true")
  expect(url.searchParams.getAll("offered_by")).toEqual(["ocw", "mitx"])
})

test("the header links the MIT OpenCourseWare logo home", async ({ page }) => {
  await page.goto(siteUrl("ocw-transition"))

  const home = page
    .getByRole("banner")
    .getByRole("link", { name: /MIT OpenCourseWare/i })
  await expect(home).toBeVisible()
  await expect(home).toHaveAttribute("href", "/")
})

for (const width of [375, 768, 1440]) {
  test(`the landing page fits a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(siteUrl("ocw-transition"))
    await expect
      .poll(() => page.evaluate(() => document.fonts.status))
      .toBe("loaded")

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByRole("search")).toBeVisible()
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
}
