import { Locator, Page } from "@playwright/test"
import { test, expect } from "../util/fixtures"
import { CoursePage, COURSE_V3_CANONICAL_DOMAIN } from "../util"
import {
  LEARN_SEARCH_FLAG,
  LEARN_SEARCH_STORAGE_KEY
} from "../../course-v2/assets/js/learn_search"

/**
 * Course v2 renders each search-linked block twice: an OCW copy and an MIT
 * Learn copy (see course-v2/layouts/partials/search_variant_copies.html). CSS
 * shows the OCW copy unless <html data-search="learn"> is set, which the
 * ocw-course-v2-learn-search PostHog flag controls. Offline packages only get
 * the OCW copy.
 */

const learnSearchUrl = (query: string) =>
  `https://${COURSE_V3_CANONICAL_DOMAIN}/search/?${query}`

const hrefsOf = (links: Locator) =>
  links.evaluateAll(elements =>
    elements.map(element => element.getAttribute("href") ?? "")
  )

/** Show the Learn copy, as the flag does. */
const showLearnCopy = (page: Page) =>
  page.evaluate(() =>
    document.documentElement.setAttribute("data-search", "learn")
  )

const homeCopy = (page: Page, variant: "ocw" | "learn") =>
  page.locator(`.course-detail-section > [data-search-variant="${variant}"]`)

const drawerCopy = (page: Page, variant: "ocw" | "learn") =>
  page.locator(`#desktop-course-drawer > [data-search-variant="${variant}"]`)

const drawerTopicsCopy = (page: Page, variant: "ocw" | "learn") =>
  page.locator(
    `#desktop-course-drawer .px-3 > [data-search-variant="${variant}"]`
  )

/** Split a Learn link into its search page and its parsed query. */
const learnLink = (href: string | null) => {
  const url = new URL(href ?? "")
  return {
    page:   `${url.origin}${url.pathname}`,
    params: Object.fromEntries(url.searchParams)
  }
}

const LEARN_TOPICS = [
  "Art, Design & Architecture",
  "Business & Management",
  "Business Analytics"
]

const topicLinksOf = (copy: Locator) =>
  copy.locator("a.course-info-topic").evaluateAll(links =>
    links.map(link => ({
      text: link.textContent?.trim() ?? "",
      href: link.getAttribute("href")
    }))
  )

const TEXT_STYLES = [
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "color",
  "text-transform"
]
const BOX_STYLES = [
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left"
]

const stylesOf = (locator: Locator, properties: string[]) =>
  locator.evaluate(
    (element, names) =>
      Object.fromEntries(
        names.map(name => [
          name,
          getComputedStyle(element).getPropertyValue(name)
        ])
      ),
    properties
  )

/**
 * Computed styles of the parts of one copy's Topics list that both copies
 * share: the heading, the list, the second topic (which has subtopics in both
 * copies) with its toggle and link, and the first visible subtopic link.
 */
const topicsStyles = async (copy: Locator) => {
  const list = copy.locator("ul.pb-2")
  const secondTopic = list.locator("> li:nth-child(2) > div.position-relative")
  return {
    heading: await stylesOf(copy.locator("h3", { hasText: "Topics" }), [
      ...TEXT_STYLES,
      ...BOX_STYLES,
      "height"
    ]),
    list:     await stylesOf(list, [...TEXT_STYLES, ...BOX_STYLES]),
    topicRow: await stylesOf(secondTopic, [...BOX_STYLES, "width", "height"]),
    toggle:   await stylesOf(secondTopic.locator("button.topic-toggle"), [
      "width",
      "height",
      "top",
      "left"
    ]),
    topicLink: await stylesOf(secondTopic.locator("a.course-info-topic"), [
      ...TEXT_STYLES,
      ...BOX_STYLES,
      "height"
    ]),
    subtopicLink: await stylesOf(
      copy.locator(".subtopic-container.show a.course-info-topic").first(),
      [...TEXT_STYLES, ...BOX_STYLES, "height"]
    )
  }
}

const INSTRUCTOR_URLS = [
  learnSearchUrl("offered_by=ocw&q=Prof.+Tester+One"),
  learnSearchUrl("offered_by=ocw&q=Dr.+Tester+Two"),
  learnSearchUrl("offered_by=ocw&q=Another+Tester+Three")
]

const DEPARTMENT_URLS = [
  learnSearchUrl("department=8&offered_by=ocw"),
  learnSearchUrl("department=6&offered_by=ocw"),
  learnSearchUrl("department=18&offered_by=ocw")
]

test.describe("Learn copy of the course info", () => {
  test.beforeEach(({ siteAlias }) => {
    test.skip(siteAlias !== "course", "Online only")
  })

  test("drawer copy links instructors, departments and level to Learn search", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/section-1", { waitUntil: "domcontentloaded" })

    const links = drawerCopy(page, "learn").locator("a[href]")
    expect(await hrefsOf(links)).toEqual([
      ...INSTRUCTOR_URLS,
      ...DEPARTMENT_URLS,
      learnSearchUrl("level=graduate&offered_by=ocw"),
      learnSearchUrl("level=undergraduate&offered_by=ocw"),
      // Not in course-v3's level map, so it passes through unchanged.
      learnSearchUrl("level=Early+Childhood&offered_by=ocw")
    ])
  })

  test("home page copy links instructors and departments to Learn search", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("", { waitUntil: "domcontentloaded" })

    const links = homeCopy(page, "learn").locator(
      "a.course-info-instructor, a.course-info-department"
    )
    expect(await hrefsOf(links)).toEqual([
      ...INSTRUCTOR_URLS,
      ...DEPARTMENT_URLS
    ])
  })

  test("the OCW copy shows by default and the Learn copy is hidden", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto()

    await expect(homeCopy(page, "ocw")).toBeVisible()
    await expect(homeCopy(page, "learn")).toBeHidden()
  })

  test("data-search=learn on <html> shows the Learn copy instead", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/section-1")
    await showLearnCopy(page)

    await expect(drawerCopy(page, "learn")).toBeVisible()
    await expect(drawerCopy(page, "ocw")).toBeHidden()
  })
})

test.describe("Learn copy of the topics", () => {
  test.beforeEach(({ siteAlias }) => {
    test.skip(siteAlias !== "course", "Online only")
  })

  test("drawer copy lists mit_learn_topics, linked to Learn search", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/section-1", { waitUntil: "domcontentloaded" })

    const links = await topicLinksOf(drawerTopicsCopy(page, "learn"))
    expect(links.map(link => link.text)).toEqual(LEARN_TOPICS)
    expect(links.map(link => learnLink(link.href))).toEqual(
      LEARN_TOPICS.map(topic => ({
        page:   `https://${COURSE_V3_CANONICAL_DOMAIN}/search/`,
        params: { offered_by: "ocw", topic }
      }))
    )
  })

  test("home page copy lists mit_learn_topics", async ({ page, siteAlias }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("", { waitUntil: "domcontentloaded" })

    const links = await topicLinksOf(homeCopy(page, "learn"))
    expect(links.map(link => link.text)).toEqual(LEARN_TOPICS)
  })

  test("a Learn topic toggle targets a unique ID and expands the Learn list", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/section-1")
    await showLearnCopy(page)

    const drawer = page.locator("#desktop-course-drawer")
    const toggle = drawer.getByRole("button", {
      name: "Business & Management subtopics"
    })
    const subtopic = drawer.getByRole("link", { name: "Business Analytics" })
    await expect(toggle).toHaveAttribute("aria-expanded", "false")
    await expect(subtopic).toBeHidden()

    // A shared ID would make Bootstrap toggle the hidden OCW list as well.
    const target = await toggle.getAttribute("aria-controls")
    await expect(page.locator(`[id="${target}"]`)).toHaveCount(1)

    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-expanded", "true")
    await expect(subtopic).toBeVisible()
  })

  const layouts = [
    {
      name:  "home page",
      route: "",
      copy:  homeCopy
    },
    {
      name:  "desktop drawer",
      route: "/pages/section-1",
      copy:  drawerTopicsCopy
    }
  ]
  for (const layout of layouts) {
    test(`the Learn topics look like the OCW topics (${layout.name})`, async ({
      page,
      siteAlias
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      const course = new CoursePage(page, siteAlias)
      await course.goto(layout.route)

      const ocw = await topicsStyles(layout.copy(page, "ocw"))

      await showLearnCopy(page)
      const learnCopy = layout.copy(page, "learn")
      // Only the second Learn topic has subtopics, and it starts collapsed.
      await learnCopy
        .getByRole("button", { name: "Business & Management subtopics" })
        .click()
      await expect(learnCopy.locator(".subtopic-container.show")).toHaveCount(1)
      const learn = await topicsStyles(learnCopy)

      expect(learn).toEqual(ocw)
    })
  }
})

/**
 * Hrefs of the header's search links whose own computed display isn't `none`.
 * The links' own display is checked, rather than visibility, because the
 * mobile menu is collapsed and the desktop header is hidden on small screens.
 * `.search-icon { display: flex }` must not beat the hide rule.
 */
const shownSearchLinks = (header: Locator) =>
  header
    .locator("a.search-icon")
    .evaluateAll(links =>
      links
        .filter(link => getComputedStyle(link).display !== "none")
        .map(link => link.getAttribute("href"))
    )

test.describe("Learn copy with an older course_v2.css", () => {
  test.beforeEach(({ siteAlias }) => {
    test.skip(siteAlias !== "course", "Online only")
  })

  // Site builds take templates from git but the webpack manifest from S3, so
  // during a release a page can get the new markup with the previous
  // release's course_v2.css. The page's own markup must still hide a copy.
  test("the page hides the Learn copy without course_v2.css", async ({
    page,
    siteAlias
  }) => {
    await page.route("**/course_v2.css", route => route.abort())
    const course = new CoursePage(page, siteAlias)
    await course.goto()

    await expect(homeCopy(page, "ocw")).toBeVisible()
    await expect(homeCopy(page, "learn")).toBeHidden()
    expect(await shownSearchLinks(page.locator("#desktop-header"))).toEqual([
      "/search/"
    ])
  })
})

test.describe("Learn copy of the header search icon", () => {
  test.beforeEach(({ siteAlias }) => {
    test.skip(siteAlias !== "course", "Online only")
  })

  const modes = [
    { name: "OCW", learn: false, href: "/search/" },
    {
      name:  "Learn",
      learn: true,
      href:  `https://${COURSE_V3_CANONICAL_DOMAIN}/search/?offered_by=ocw`
    }
  ]
  for (const mode of modes) {
    test(`in ${mode.name} mode each header shows one search icon, linked to ${mode.name} search`, async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("")
      if (mode.learn) await showLearnCopy(page)

      expect(await shownSearchLinks(page.locator("#desktop-header"))).toEqual([
        mode.href
      ])
      expect(await shownSearchLinks(page.locator("#mobile-header"))).toEqual([
        mode.href
      ])
    })
  }
})

test.describe("The ocw-course-v2-learn-search flag", () => {
  test.beforeEach(({ siteAlias }) => {
    test.skip(siteAlias !== "course", "Online only")
  })

  /** Pretend this visitor's flags already chose a copy on an earlier visit. */
  const rememberLearnCopy = (page: Page) =>
    page.addInitScript(key => {
      // Init scripts also run in iframes, and the Appzi widget's srcdoc iframe
      // shares this page's localStorage: seeding there would undo the bundle
      // clearing the value.
      if (window === window.top) localStorage.setItem(key, "true")
    }, LEARN_SEARCH_STORAGE_KEY)

  const rememberedValue = (page: Page) =>
    page.evaluate(key => localStorage.getItem(key), LEARN_SEARCH_STORAGE_KEY)

  /**
   * Answer PostHog's onFeatureFlags with the flag on or off, the way
   * ask-tim-v3.spec.ts does: intercept the client course-v2.tsx assigns to
   * window.posthog and replace its onFeatureFlags.
   */
  const stubFlag = (page: Page, enabled: boolean) =>
    page.addInitScript(
      ({ enabled, flag }) => {
        type FlagsCallback = (
          flags: string[],
          variants: Record<string, string | boolean>,
          context?: { errorsLoading?: boolean }
        ) => void
        let client: unknown
        Object.defineProperty(window, "posthog", {
          configurable: true,
          get:          () => client,
          set:          (value: { onFeatureFlags: unknown }) => {
            value.onFeatureFlags = (callback: FlagsCallback) => {
              window.setTimeout(() =>
                callback(enabled ? [flag] : [], {}, { errorsLoading: false })
              )
              return () => undefined
            }
            client = value
          }
        })
      },
      { enabled, flag: LEARN_SEARCH_FLAG }
    )

  test("a remembered Learn value shows the Learn copy before the bundle runs", async ({
    page,
    siteAlias
  }) => {
    await rememberLearnCopy(page)
    // Without course_v2.js, only the inline script in <head> and the CSS can
    // pick the copy.
    await page.route("**/course_v2.js", route => route.abort())
    const course = new CoursePage(page, siteAlias)
    await course.goto()

    await expect(homeCopy(page, "learn")).toBeVisible()
    await expect(homeCopy(page, "ocw")).toBeHidden()
  })

  test("the flag turned on shows the Learn copy and remembers it", async ({
    page,
    siteAlias
  }) => {
    await stubFlag(page, true)
    const course = new CoursePage(page, siteAlias)
    await course.goto()

    await expect(homeCopy(page, "learn")).toBeVisible()
    await expect(homeCopy(page, "ocw")).toBeHidden()
    expect(await rememberedValue(page)).toBe("true")
  })

  test("the flag turned off restores the OCW copy and forgets it", async ({
    page,
    siteAlias
  }) => {
    await rememberLearnCopy(page)
    await stubFlag(page, false)
    const course = new CoursePage(page, siteAlias)
    await course.goto()

    await expect(homeCopy(page, "ocw")).toBeVisible()
    await expect(homeCopy(page, "learn")).toBeHidden()
    await expect.poll(() => rememberedValue(page)).toBeNull()
  })
})

test.describe("Learn copy without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("the OCW copy shows and the Learn copy is hidden", async ({
    page,
    siteAlias
  }) => {
    test.skip(siteAlias !== "course", "Online only")
    const course = new CoursePage(page, siteAlias)
    await course.goto()

    await expect(homeCopy(page, "ocw")).toBeVisible()
    await expect(homeCopy(page, "learn")).toBeHidden()
  })
})

test("offline packages render only the OCW course info, without wrappers", async ({
  page,
  siteAlias
}) => {
  test.skip(siteAlias !== "course-offline", "Offline only")
  const course = new CoursePage(page, siteAlias)
  await course.goto("", { waitUntil: "domcontentloaded" })

  await expect(page.locator("[data-search-variant]")).toHaveCount(0)
  await expect(page.locator(".search-variant")).toHaveCount(0)
  await expect(
    page.locator(".course-detail-section .course-info-instructor")
  ).toHaveCount(3)
})
