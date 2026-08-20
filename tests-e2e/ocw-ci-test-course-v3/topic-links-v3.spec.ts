import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

/**
 * v3 course pages are served by MIT Learn, whose topic vocabulary is much
 * smaller than OCW's. get_topic_search_url.html therefore looks each OCW topic
 * up in course-v3/data/mit_learn_topic_map.json and filters search by the Learn
 * topic(s) it maps to, falling back to a text query when there is no mapping.
 *
 * The fixture course (test-sites/ocw-ci-test-course/data/course.json) covers
 * every branch:
 *  - a straight one-to-one mapping (Engineering, Computer Science, Physics)
 *  - an OCW topic with no Learn equivalent of its own, which maps to its
 *    nearest Learn topic (Quantum Mechanics -> Physics)
 *  - an OCW topic mapping to several Learn topics, which repeats the param
 *    (Artificial Intelligence -> AI + Machine Learning)
 *  - an unmapped OCW topic, which falls back to ?q= (Science)
 */
const EXPECTED_LINKS: Record<string, string> = {
  engineering:                       "/search/?topic=Engineering",
  "computer science":                "/search/?topic=Computer+Science",
  "software design and engineering":
    "/search/?topic=Software+Design+and+Engineering",
  "artificial intelligence": "/search/?topic=AI&topic=Machine+Learning",
  physics:                   "/search/?topic=Physics",
  "quantum mechanics":       "/search/?topic=Physics",
  science:                   "/search/?q=Science"
}

/**
 * Topic links render once per Course Info variant (desktop and mobile), so
 * collect them keyed by label and dedupe the hrefs.
 */
const topicLinks = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const byLabel: Record<string, string[]> = {}
    for (const anchor of Array.from(
      document.querySelectorAll("a.course-info-topic")
    )) {
      const label = (anchor.textContent ?? "").trim().toLowerCase()
      const href = anchor.getAttribute("href") ?? ""
      byLabel[label] = byLabel[label] ?? []
      if (!byLabel[label].includes(href)) {
        byLabel[label].push(href)
      }
    }
    return byLabel
  })

test.describe("Course v3 topic links", () => {
  test("link to MIT Learn topic filters, or a text query when unmapped", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/", { waitUntil: "domcontentloaded" })

    const links = await topicLinks(page)

    expect(Object.keys(links).sort()).toEqual(
      Object.keys(EXPECTED_LINKS).sort()
    )
    for (const [label, href] of Object.entries(EXPECTED_LINKS)) {
      expect(links[label]).toEqual([href])
    }
  })

  test("no topic link uses the legacy OCW `t` param", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/", { waitUntil: "domcontentloaded" })

    const links = await topicLinks(page)
    const hrefs = Object.values(links).flat()

    expect(hrefs.length).toBeGreaterThan(0)
    for (const href of hrefs) {
      const params = new URL(href, "https://example.com").searchParams
      expect(params.has("t")).toBe(false)
      expect(params.has("topic") || params.has("q")).toBe(true)
    }
  })
})
