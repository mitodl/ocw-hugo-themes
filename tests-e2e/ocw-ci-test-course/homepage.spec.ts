import { env } from "../../env"
import { test, expect } from "@playwright/test"
import { getFirstAfter, CoursePage } from "../util"

test("Course page has title in <head>", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto()
  await expect(page).toHaveTitle(/OCW CI Test Course/)
})

test.describe("Course info", () => {
  const listData = [
    {
      label:    "Instructors",
      expected: {
        texts:        ["Prof. Tester One", "Dr. Tester Two", "Another Tester Three"],
        searchParams: [
          "?q=Prof.+Tester+One",
          "?q=Dr.+Tester+Two",
          "?q=Another+Tester+Three"
        ]
      }
    },
    {
      label:    "Departments",
      expected: {
        texts: [
          "Physics",
          "Electrical Engineering and Computer Science",
          "Mathematics"
        ],
        searchParams: [
          "?d=Physics",
          "?d=Electrical+Engineering+and+Computer+Science",
          "?d=Mathematics"
        ]
      }
    }
  ]

  listData.forEach(({ label, expected }) => {
    test(`Lists ${label} with links to search page`, async ({ page }) => {
      const course = new CoursePage(page, "course")
      await course.goto()
      const courseInfo = course.getCourseInfo()

      const list = await getFirstAfter(
        courseInfo.getByRole("list"),
        courseInfo.getByText(label)
      )
      const items = list.getByRole("listitem")
      const links = list.getByRole("link")

      const texts = (await items.allInnerTexts()).map(s => s.trim())
      expect(texts).toEqual(expected.texts)

      const hrefs = await links.evaluateAll(links => {
        return links.map(link => (link as HTMLAnchorElement).href)
      })
      const urls = hrefs.map(href => new URL(href))
      expect(urls.map(url => url.search)).toEqual(expected.searchParams)
      expect(urls.every(url => url.pathname === "/search")).toBe(true)
    })
  })
})

test("Has expected meta tags in <head>", async ({ page }) => {
  const sitemapDomain = env.SITEMAP_DOMAIN ? env.SITEMAP_DOMAIN : "https://live-qa.ocw.mit.edu"
  const course = new CoursePage(page, "course")
  await course.goto()
  const metaShareImage = page.locator('meta[property="og:image"]')
  const metaTwitterSite = page.locator('meta[name="twitter:site"]')
  const metaTwitterImage = page.locator('meta[name="twitter:image:src"]')
  const metaTwitterCard = page.locator('meta[name="twitter:card"]')
  await expect(metaShareImage).toHaveAttribute(
    "content",
    `https://${sitemapDomain}/courses/123-ocw-ci-test-course-fall-2022/example_jpg.jpg`
  )
  await expect(metaTwitterSite).toHaveAttribute("content", "@mitocw")
  await expect(metaTwitterImage).toHaveAttribute(
    "content",
    `https://${sitemapDomain}/courses/123-ocw-ci-test-course-fall-2022/example_jpg.jpg`
  )
  await expect(metaTwitterCard).toHaveAttribute(
    "content",
    "summary_large_image"
  )
})
