import { env } from "../../env"
import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 SEO", () => {
  test("Course v3 homepage emits expected social metadata", async ({
    page
  }) => {
    const sitemapDomain = env.SITEMAP_DOMAIN ?
      env.SITEMAP_DOMAIN :
      "live-qa.ocw.mit.edu"
    const courseImagePath = "/courses/ocw-ci-test-course/example_jpg.jpg"
    const course = new CoursePage(page, "course-v3")

    await course.goto("/")

    const metaShareImage = page.locator('meta[property="og:image"]')
    const metaShareImageAlt = page.locator('meta[property="og:image:alt"]')
    const metaTwitterSite = page.locator('meta[name="twitter:site"]')
    const metaTwitterImage = page.locator('meta[name="twitter:image:src"]')
    const metaTwitterCard = page.locator('meta[name="twitter:card"]')

    await expect(metaShareImage).toHaveAttribute(
      "content",
      `https://${sitemapDomain}${courseImagePath}`
    )
    await expect(metaShareImageAlt).toHaveAttribute(
      "content",
      "OCW CI Test Course"
    )
    await expect(metaTwitterSite).toHaveAttribute("content", "@mitocw")
    await expect(metaTwitterImage).toHaveAttribute(
      "content",
      `https://${sitemapDomain}${courseImagePath}`
    )
    await expect(metaTwitterCard).toHaveAttribute(
      "content",
      "summary_large_image"
    )
  })

  test("Course v3 robots.txt allows crawling by default", async ({ page }) => {
    const sitemapDomain = env.SITEMAP_DOMAIN ?
      env.SITEMAP_DOMAIN :
      "live-qa.ocw.mit.edu"
    const course = new CoursePage(page, "course-v3")

    const response = await course.goto("/robots.txt")

    expect(response?.ok()).toBeTruthy()
    await expect(page.locator("body")).toContainText(
      `Sitemap: https://${sitemapDomain}/sitemap.xml`
    )
    await expect(page.locator("body")).toContainText("Allow: /")
  })
})
