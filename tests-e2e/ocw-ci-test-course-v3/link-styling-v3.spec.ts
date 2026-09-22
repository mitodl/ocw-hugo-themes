import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

/**
 * Guards the specificity of the global link rule in
 * base-theme/assets/css/main.scss, which paints every anchor black and
 * underlined. Course chrome (nav, header, buttons) switches that off with
 * single-class rules, so the global rule has to stay at 0-0-1 to lose to them.
 *
 * Wrapping an exclusion in a bare `:not()` raises it to 0-1-1, which beats
 * every one of those rules and underlines the whole nav and blackens the
 * buttons. `:not(:where(...))` keeps the exclusion without the specificity.
 *
 * The prose assertion is the other half of the guard: it fails if the global
 * rule is deleted rather than de-specified, so the chrome assertions cannot
 * start passing for the wrong reason.
 */

const CONTENT_PAGE = "/pages/external-resources-page"

test("Course nav links are not underlined", async ({ page }) => {
  const course = new CoursePage(page, "course-v3")
  await course.goto(CONTENT_PAGE, { waitUntil: "domcontentloaded" })

  const navLinks = page.locator(".course-nav a.nav-link")
  expect(await navLinks.count()).toBeGreaterThan(0)

  const decorations = await navLinks.evaluateAll(els => [
    ...new Set(els.map(el => getComputedStyle(el).textDecorationLine))
  ])
  expect(decorations).toEqual(["none"])
})

test("Download button keeps its own colors", async ({ page }) => {
  const course = new CoursePage(page, "course-v3")
  await course.goto(CONTENT_PAGE, { waitUntil: "domcontentloaded" })

  const download = page.locator(".download-course-button-v3").first()
  await expect(download).toHaveCSS("text-decoration-line", "none")
  await expect(download).toHaveCSS("color", "rgb(255, 255, 255)")
})

test("Prose links keep their underline", async ({ page }) => {
  const course = new CoursePage(page, "course-v3")
  await course.goto(CONTENT_PAGE, { waitUntil: "domcontentloaded" })

  const proseLinks = course.withinContent().locator("a")
  expect(await proseLinks.count()).toBeGreaterThan(0)

  const decorations = await proseLinks.evaluateAll(els => [
    ...new Set(els.map(el => getComputedStyle(el).textDecorationLine))
  ])
  expect(decorations).toEqual(["underline"])
})
