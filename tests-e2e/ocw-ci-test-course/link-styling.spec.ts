import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

/**
 * course-v2 counterpart of ocw-ci-test-course-v3/link-styling-v3.spec.ts.
 *
 * The global link rule lives in base-theme, so every theme that compiles it is
 * exposed to the same specificity mistake. See that spec for the reasoning.
 */

const CONTENT_PAGE = "/pages/external-resources-page"

test("Course nav links are not underlined", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto(CONTENT_PAGE, { waitUntil: "domcontentloaded" })

  const navLinks = page.locator(".course-nav a.nav-link")
  expect(await navLinks.count()).toBeGreaterThan(0)

  const decorations = await navLinks.evaluateAll(els => [
    ...new Set(els.map(el => getComputedStyle(el).textDecorationLine))
  ])
  expect(decorations).toEqual(["none"])
})

test("Prose links keep their underline", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto(CONTENT_PAGE, { waitUntil: "domcontentloaded" })

  const proseLinks = course.withinContent().locator("a")
  expect(await proseLinks.count()).toBeGreaterThan(0)

  const decorations = await proseLinks.evaluateAll(els => [
    ...new Set(els.map(el => getComputedStyle(el).textDecorationLine))
  ])
  expect(decorations).toEqual(["underline"])
})
