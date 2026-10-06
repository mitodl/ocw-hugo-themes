import { Locator, Page } from "@playwright/test"
import { test, expect } from "../util/fixtures"
import { CoursePage, COURSE_V3_CANONICAL_DOMAIN } from "../util"

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
