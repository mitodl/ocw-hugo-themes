import { env } from "../../env"
import { test, expect } from "../util/fixtures"
import { CoursePage, COURSE_V3_CANONICAL_DOMAIN, siteUrl } from "../util"

const CANONICAL_COURSE_URL = `https://${COURSE_V3_CANONICAL_DOMAIN}/courses/o/ocw-ci-test-course/`

test.describe("Course v3 SEO", () => {
  test("Course v3 homepage emits expected social metadata", async ({
    page,
    siteAlias
  }) => {
    const courseImageUrl = `${CANONICAL_COURSE_URL}example_jpg.jpg`
    const course = new CoursePage(page, siteAlias)

    await course.goto("/")

    const metaShareImage = page.locator('meta[property="og:image"]')
    const metaShareImageAlt = page.locator('meta[property="og:image:alt"]')
    const metaTwitterSite = page.locator('meta[name="twitter:site"]')
    const metaTwitterImage = page.locator('meta[name="twitter:image:src"]')
    const metaTwitterCard = page.locator('meta[name="twitter:card"]')

    await expect(metaShareImage).toHaveAttribute("content", courseImageUrl)
    await expect(metaShareImageAlt).toHaveAttribute(
      "content",
      "OCW CI Test Course"
    )
    await expect(metaTwitterSite).toHaveAttribute("content", "@mitocw")
    await expect(metaTwitterImage).toHaveAttribute("content", courseImageUrl)
    await expect(metaTwitterCard).toHaveAttribute(
      "content",
      "summary_large_image"
    )
  })

  test("Course v3 pages name the canonical domain as their own URL", async ({
    page,
    siteAlias
  }) => {
    test.skip(siteAlias !== "course-v3", "Online only")

    const sitemapDomain = env.SITEMAP_DOMAIN ?
      env.SITEMAP_DOMAIN :
      "live-qa.ocw.mit.edu"
    const course = new CoursePage(page, siteAlias)

    for (const route of ["/", "pages/syllabus/"]) {
      const expectedUrl = `${CANONICAL_COURSE_URL}${route.replace(/^\//, "")}`
      await course.goto(route)

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        expectedUrl
      )
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        expectedUrl
      )
      const parsed = JSON.parse(
        (await page
          .locator('script[type="application/ld+json"]')
          .textContent()) ?? ""
      )
      // course-v3 currently emits its JSON-LD double-encoded, as a JSON string.
      const jsonLd = typeof parsed === "string" ? JSON.parse(parsed) : parsed
      expect(jsonLd.url).toBe(expectedUrl)
      expect(jsonLd.publisher).toEqual({
        "@type": "CollegeOrUniversity",
        name:    "MIT OpenCourseWare",
        url:     `https://${sitemapDomain}`
      })
    }
  })

  test("Course v3 sitemap lists only canonical domain URLs", async ({
    request,
    siteAlias
  }) => {
    test.skip(siteAlias !== "course-v3", "Online only")

    const response = await request.get(siteUrl(siteAlias, "sitemap.xml"))
    expect(response.ok()).toBeTruthy()

    const locs = [
      ...(await response.text()).matchAll(/<loc>(.*?)<\/loc>/g)
    ].map(match => match[1])
    expect(locs).toContain(CANONICAL_COURSE_URL)
    expect(locs.filter(loc => !loc.startsWith(CANONICAL_COURSE_URL))).toEqual(
      []
    )
  })

  test("Course v3 robots.txt allows crawling by default", async ({
    page,
    siteAlias
  }) => {
    const sitemapDomain = env.SITEMAP_DOMAIN ?
      env.SITEMAP_DOMAIN :
      "live-qa.ocw.mit.edu"
    const course = new CoursePage(page, siteAlias)

    const response = await course.goto("/robots.txt")

    expect(response?.ok()).toBeTruthy()
    await expect(page.locator("body")).toContainText(
      `Sitemap: https://${sitemapDomain}/sitemap.xml`
    )
    await expect(page.locator("body")).toContainText("Allow: /")
  })
})
