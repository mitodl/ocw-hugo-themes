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

  test("Course v3 canonical URL uses Learn domain with /courses/o/ path", async ({ page }) => {
    const canonicalDomain = env.COURSE_V3_CANONICAL_DOMAIN ?
      env.COURSE_V3_CANONICAL_DOMAIN :
      "learn.mit.edu"
    const course = new CoursePage(page, "course-v3")

    await course.goto("/")

    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveAttribute(
      "href",
      new RegExp(`^https://${canonicalDomain}/courses/o/ocw-ci-test-course/`)
    )

    const ogUrl = page.locator('meta[property="og:url"]')
    await expect(ogUrl).toHaveAttribute(
      "content",
      new RegExp(`^https://${canonicalDomain}/courses/o/ocw-ci-test-course/`)
    )
  })

  test("Course v3 subpage canonical URL includes subpath after course key", async ({
    page
  }) => {
    const canonicalDomain = env.COURSE_V3_CANONICAL_DOMAIN ?
      env.COURSE_V3_CANONICAL_DOMAIN :
      "learn.mit.edu"
    const course = new CoursePage(page, "course-v3")

    await course.goto("/pages/syllabus")

    const canonical = page.locator('link[rel="canonical"]')
    const href = await canonical.getAttribute("href")
    expect(href).toBe(
      `https://${canonicalDomain}/courses/o/ocw-ci-test-course/pages/syllabus/`
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
