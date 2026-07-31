import { test, expect } from "@playwright/test"
import { offlineFileUrl, COURSE_V3_CANONICAL_DOMAIN } from "../util"

/**
 * Search and facet links (departments, topics, level, instructors) all funnel
 * through get_search_url.html. base-offline prefixes an absolute host because a
 * root-relative /search/ cannot resolve in an offline package, and
 * course-offline-v3 overrides search_base_url.html so that host is the v3
 * canonical domain rather than the static API host.
 *
 * The query parameter names come from course-v3/data/search_query_keys.json,
 * which wins the data merge — they are MIT Learn's names (department, level, t, q).
 *
 * These links are intentionally absolute, so expectLocalPackageHref does not
 * apply. They carry strip-link-offline, so hide_offline_links.html unwraps them
 * to plain text when the reader has no connectivity.
 */
const CANONICAL = `https://${COURSE_V3_CANONICAL_DOMAIN}`

const searchHrefs = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href*="/search/?"]')).map(
      a => a.getAttribute("href") ?? ""
    )
  )

test.describe("offline-v3 search and facet links", () => {
  test("department links use the v3 canonical domain", async ({ page }) => {
    await page.goto(offlineFileUrl("/"))

    const hrefs = await searchHrefs(page)
    const departments = hrefs.filter(h => h.includes("department="))

    expect(departments.length).toBeGreaterThan(0)
    for (const href of departments) {
      expect(href.startsWith(`${CANONICAL}/search/?`)).toBe(true)
    }
  })

  test("level links use the v3 canonical domain", async ({ page }) => {
    await page.goto(offlineFileUrl("/"))

    const hrefs = await searchHrefs(page)
    const levels = hrefs.filter(h => h.includes("level="))

    expect(levels.length).toBeGreaterThan(0)
    for (const href of levels) {
      expect(href.startsWith(`${CANONICAL}/search/?`)).toBe(true)
    }
  })

  test("every search link is hosted on the v3 canonical domain", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/"))

    const hrefs = await searchHrefs(page)

    // Pin the parsed host rather than blocklisting the hosts we do not want
    // (ocw.mit.edu from base-theme's default, localhost from
    // STATIC_API_BASE_URL). A blocklist can never be complete, and matching a
    // substring of a URL is the weaker test.
    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      expect(new URL(href).host).toBe(COURSE_V3_CANONICAL_DOMAIN)
    }
  })

  test("search links are absolute, not relativized into the package", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/"))

    const hrefs = await searchHrefs(page)

    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      expect(href.startsWith("https://")).toBe(true)
    }
  })

  test("facet links carry strip-link-offline so they degrade without a network", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/"))

    const stripped = await page.evaluate(
      () =>
        Array.from(
          document.querySelectorAll('a[href*="/search/?"].strip-link-offline')
        ).length
    )

    expect(stripped).toBeGreaterThan(0)
  })
})
