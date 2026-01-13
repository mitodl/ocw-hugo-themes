import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"
import type { Page } from "@playwright/test"

/**
 * Helper function to inject test HTML for video gallery card testing
 */
const injectTestHTML = async (
  page: Page,
  options: {
    includeCard?: boolean
    includeThumbnail?: boolean
    includeTitle?: boolean
    visible?: boolean
  } = {}
): Promise<void> => {
  const {
    includeCard = true,
    includeThumbnail = false,
    includeTitle = false,
    visible = false
  } = options

  await page.evaluate(
    ({ includeCard, includeThumbnail, includeTitle, visible }) => {
      const container = document.createElement("div")
      container.className = "video-gallery-cards-container"

      if (!visible) {
        container.style.visibility = "hidden"
        container.style.position = "absolute"
      } else {
        container.style.position = "absolute"
        container.style.top = "0"
        container.style.left = "0"
        container.style.zIndex = "9999"
      }

      if (includeCard) {
        const card = document.createElement("a")
        card.className = "video-gallery-card"
        card.href = "#"

        if (visible) {
          card.style.width = "200px"
          card.style.height = "50px"
        }

        if (includeThumbnail) {
          const thumbnail = document.createElement("div")
          thumbnail.className = "video-gallery-card-thumbnail"
          card.appendChild(thumbnail)
        }

        if (includeTitle) {
          const title = document.createElement("div")
          title.className = "video-gallery-card-title"
          title.textContent =
            includeCard && !includeThumbnail ? "Test Video Title" : "Test Video"
          card.appendChild(title)
        }

        container.appendChild(card)
      }

      document.body.appendChild(container)
    },
    { includeCard, includeThumbnail, includeTitle, visible }
  )
}

test.describe("Course v3 Video Gallery Styles", () => {
  let course: CoursePage

  test.beforeEach(async ({ page }) => {
    course = new CoursePage(page, "course-v3")
    await course.goto("/pages/multiple-videos-series-overview")
  })
  test("Video gallery CSS is loaded and contains correct styles", async ({
    page
  }) => {
    // Check that course-v3 CSS is loaded
    const stylesheets = await page.evaluate(() =>
      Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return sheet.href
          } catch {
            return null
          }
        })
        .filter(Boolean)
    )

    const courseV3CSS = stylesheets.find(href =>
      href?.includes("course_v3.css")
    )
    expect(courseV3CSS).toBeTruthy()

    // Verify video gallery card styles exist in CSS
    const hasVideoGalleryStyles = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets)
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          const hasCardContainer = rules.some(
            rule =>
              rule instanceof CSSStyleRule &&
              rule.selectorText?.includes(".video-gallery-cards-container")
          )
          const hasCard = rules.some(
            rule =>
              rule instanceof CSSStyleRule &&
              rule.selectorText?.includes(".video-gallery-card")
          )
          if (hasCardContainer && hasCard) {
            return true
          }
        } catch {
          // Cross-origin stylesheet, skip
        }
      }
      return false
    })

    expect(hasVideoGalleryStyles).toBe(true)
  })

  test("Video gallery container styles are defined correctly", async ({
    page
  }) => {
    // Inject test HTML to verify styles
    await injectTestHTML(page, { includeCard: false })

    const container = page.locator(".video-gallery-cards-container")
    await expect(container).toBeAttached()

    // Verify container styles - flex layout with 16px gap
    await expect(container).toHaveCSS("display", "flex")
    await expect(container).toHaveCSS("flex-direction", "column")
    await expect(container).toHaveCSS("gap", "16px")
    await expect(container).toHaveCSS("cursor", "pointer")
  })

  test("Video gallery card styles are defined correctly", async ({ page }) => {
    // Inject test HTML to verify card styles
    await injectTestHTML(page, {
      includeCard:      true,
      includeThumbnail: true,
      includeTitle:     true
    })

    const card = page.locator(".video-gallery-card")
    await expect(card).toBeAttached()

    // Check card layout
    await expect(card).toHaveCSS("display", "flex")
    await expect(card).toHaveCSS("align-items", "center")
    await expect(card).toHaveCSS("gap", "16px")
    await expect(card).toHaveCSS("padding", "4px")
    await expect(card).toHaveCSS("border-radius", "4px")

    // Check borders (all sides)
    const borderColor = "rgb(221, 225, 230)" // #dde1e6
    await expect(card).toHaveCSS("border-color", borderColor)

    // Check box-shadow
    const boxShadow = await card.evaluate(
      el => window.getComputedStyle(el).boxShadow
    )
    expect(boxShadow).toContain("rgba(3, 21, 45, 0.05)")
  })

  test("Video gallery card thumbnail styles are correct", async ({ page }) => {
    // Inject test HTML
    await injectTestHTML(page, { includeCard: true, includeThumbnail: true })

    const thumbnail = page.locator(".video-gallery-card-thumbnail")
    await expect(thumbnail).toBeAttached()

    // Check thumbnail dimensions and styling
    await expect(thumbnail).toHaveCSS("width", "104px")
    await expect(thumbnail).toHaveCSS("min-width", "104px")
    await expect(thumbnail).toHaveCSS("height", "60px")
    await expect(thumbnail).toHaveCSS("background-color", "rgb(0, 0, 0)")
    await expect(thumbnail).toHaveCSS("border-radius", "4px")
  })

  test("Video gallery card title styles are correct", async ({ page }) => {
    // Inject test HTML
    await injectTestHTML(page, { includeCard: true, includeTitle: true })

    const title = page.locator(".video-gallery-card-title")
    await expect(title).toBeAttached()

    // Check title typography and layout
    await expect(title).toHaveCSS("font-size", "14px")
    await expect(title).toHaveCSS("font-weight", "400")
    await expect(title).toHaveCSS("line-height", "18px")
    await expect(title).toHaveCSS("text-align", "left")
    await expect(title).toHaveCSS("word-break", "break-word")
    // Browsers may return either "1 1 0px" or "1 1 0%"
    const flexValue = await title.evaluate(
      el => window.getComputedStyle(el).flex
    )
    expect(flexValue).toMatch(/^1 1 (0px|0%)$/)
  })

  test("Video gallery card hover state is defined", async ({ page }) => {
    // Inject test HTML (make visible for hover to work properly)
    await injectTestHTML(page, {
      includeCard:  true,
      includeTitle: true,
      visible:      true
    })

    const card = page.locator(".video-gallery-card")
    await expect(card).toBeAttached()

    // Check initial background
    await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)")

    // Hover and check background changes
    await card.hover({ force: true })
    await page.waitForTimeout(200)

    await expect(card).toHaveCSS("background-color", "rgb(254, 251, 245)")
  })

  test("Video gallery card has no text decoration", async ({ page }) => {
    // Inject test HTML
    await injectTestHTML(page, { includeCard: true })

    const card = page.locator(".video-gallery-card")
    await expect(card).toBeAttached()
    await expect(card).toHaveCSS("text-decoration-line", "none")
  })
})
