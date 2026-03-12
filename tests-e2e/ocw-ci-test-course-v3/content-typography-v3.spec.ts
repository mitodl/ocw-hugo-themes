import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 content typography and spacing", () => {
  test("Body copy uses 22px line-height for 14px content text", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const paragraph = page.locator("#course-content-section > p").first()
    await expect(paragraph).toBeVisible()
    await expect(paragraph).toHaveCSS("line-height", "22px")
  })

  test("Table cells inherit 22px line-height", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const td = page.locator("#course-content-section td").first()
    const th = page.locator("#course-content-section th").first()
    await expect(td).toBeVisible()
    await expect(th).toBeVisible()
    await expect(td).toHaveCSS("line-height", "22px")
    await expect(th).toHaveCSS("line-height", "22px")
  })

  test("Paragraph blocks use 24px spacing globally", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const firstParagraph = page.locator("#course-content-section > p").first()
    const secondParagraph = page.locator("#course-content-section > p").nth(1)

    await expect(firstParagraph).toBeVisible()
    await expect(secondParagraph).toBeVisible()
    await expect(firstParagraph).toHaveCSS("margin-bottom", "0px")
    await expect(secondParagraph).toHaveCSS("margin-top", "24px")
  })

  test("First direct child of content section has no bottom margin", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const firstChild = page.locator("#course-content-section > *").first()
    await expect(firstChild).toBeVisible()
    await expect(firstChild).toHaveCSS("margin-bottom", "0px")
  })

  test("Syllabus heading-to-paragraph uses compact 8px spacing", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/syllabus")

    const heading = page
      .locator("#course-content-section > :is(h2, h3)")
      .first()
    const firstParagraph = page.locator("#course-content-section > p").first()

    await expect(heading).toBeVisible()
    await expect(firstParagraph).toBeVisible()
    // heading -> paragraph = 8px (compact, not 40px)
    await expect(firstParagraph).toHaveCSS("margin-top", "8px")
  })

  test("Syllabus paragraph-to-table uses global 40px gap", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/syllabus")

    // The Grading Policy section has: h2 -> p -> table.
    // h2 -> p uses compact 8px; p -> table uses the global 40px section gap.
    const table = page.locator("#course-content-section > table").first()
    await expect(table).toBeVisible()
    await expect(table).toHaveCSS("margin-top", "40px")
  })

  test("Syllabus heading-to-table transition under Calendar uses 8px gap", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/syllabus")

    const calendarHeading = page
      .locator("#course-content-section > :is(h2, h3)")
      .filter({ hasText: "Calendar" })
    const calendarTable = page.locator(
      "#course-content-section > :is(h2, h3):has-text('Calendar') + table"
    )

    await expect(calendarHeading).toBeVisible()
    await expect(calendarTable).toBeVisible()
    await expect(calendarTable).toHaveCSS("margin-top", "8px")
  })

  test("Syllabus headings still use 40px gap between sections", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/syllabus")

    // "Goals" heading follows a table — should still get the full 40px section gap
    const goalsHeading = page
      .locator("#course-content-section > :is(h2, h3)")
      .filter({ hasText: "Goals" })
    await expect(goalsHeading).toBeVisible()
    await expect(goalsHeading).toHaveCSS("margin-top", "40px")

    // "Grading Policy" heading follows a paragraph — also 40px
    const gradingHeading = page
      .locator("#course-content-section > :is(h2, h3)")
      .filter({ hasText: "Grading Policy" })
    await expect(gradingHeading).toBeVisible()
    await expect(gradingHeading).toHaveCSS("margin-top", "40px")
  })

  test("Syllabus section heading weights are consistent", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/syllabus")

    const courseInfoHeading = page
      .locator("#course-content-section > :is(h2, h3)")
      .filter({ hasText: "Course Information" })
    const meetingTimesHeading = page
      .locator("#course-content-section > :is(h2, h3)")
      .filter({ hasText: "Course Meeting Times" })

    await expect(courseInfoHeading).toBeVisible()
    await expect(meetingTimesHeading).toBeVisible()

    await expect(courseInfoHeading).toHaveCSS("font-weight", "700")
    await expect(meetingTimesHeading).toHaveCSS("font-weight", "700")
  })

  test("Heading levels step down by 2px from title to nested headings", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")

    await course.goto("/pages/syllabus")
    const pageTitle = page.locator(".resource-page-title").first()
    const sectionHeading = page
      .locator("#course-content-section > :is(h2, h3)")
      .filter({ hasText: "Course Information" })
    const nestedHeading = page.locator("#course-content-section h4").first()

    await expect(pageTitle).toBeVisible()
    await expect(sectionHeading).toBeVisible()
    await expect(nestedHeading).toBeVisible()

    // 18px → 16px → 14px hierarchy, all bold
    await expect(pageTitle).toHaveCSS("font-size", "18px")
    await expect(pageTitle).toHaveCSS("font-weight", "700")
    await expect(sectionHeading).toHaveCSS("font-size", "16px")
    await expect(sectionHeading).toHaveCSS("font-weight", "700")
    await expect(nestedHeading).toHaveCSS("font-size", "14px")
    await expect(nestedHeading).toHaveCSS("font-weight", "700")
  })

  test("Mobile content blocks use 24px spacing globally", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const secondParagraph = page.locator("#course-content-section > p").nth(1)
    await expect(secondParagraph).toBeVisible()
    await expect(secondParagraph).toHaveCSS("margin-top", "24px")
  })

  test("Mobile syllabus heading-to-content uses compact 16px spacing", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/syllabus")

    const firstParagraph = page.locator("#course-content-section > p").first()
    const calendarTable = page.locator(
      "#course-content-section > :is(h2, h3):has-text('Calendar') + table"
    )

    await expect(firstParagraph).toBeVisible()
    await expect(calendarTable).toBeVisible()
    // heading -> content = 16px on mobile (vs 8px on desktop)
    await expect(firstParagraph).toHaveCSS("margin-top", "16px")
    await expect(calendarTable).toHaveCSS("margin-top", "16px")
  })

  test("Mobile syllabus uses 24px global section spacing", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/syllabus")

    // "Goals" heading follows a table — gets the mobile global 1.5rem=24px gap
    const goalsHeading = page
      .locator("#course-content-section > :is(h2, h3)")
      .filter({ hasText: "Goals" })
    await expect(goalsHeading).toBeVisible()
    await expect(goalsHeading).toHaveCSS("margin-top", "24px")
  })

  test("Last table in content does not add extra bottom spacing", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const lastTable = page.locator("#course-content-section table").last()
    await expect(lastTable).toBeVisible()
    await expect(lastTable).toHaveCSS("margin-bottom", "0px")
  })

  test("Last child of content section has no bottom margin", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const lastChild = page
      .locator("#course-content-section > *:not(:empty)")
      .last()
    await expect(lastChild).toBeVisible()
    await expect(lastChild).toHaveCSS("margin-bottom", "0px")
  })

  test("Content headings render with consistent black color", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const heading = page.locator("#course-content-section h3").first()
    await expect(heading).toBeVisible()
    await expect(heading).toHaveCSS("color", "rgb(0, 0, 0)")
  })

  test("Content links use red on hover", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const link = page.locator("#course-content-section a").first()
    await expect(link).toBeVisible()
    await link.hover()
    await expect(link).toHaveCSS("color", "rgb(163, 31, 52)")
  })

  test("Course info topic links use red on hover", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("")

    const topicLink = page.locator(".course-info-topic:visible").first()
    await expect(topicLink).toBeVisible()
    await topicLink.hover()
    await expect(topicLink).toHaveCSS("color", "rgb(163, 31, 52)")
  })

  test("Multiple choice buttons use secondary and primary styles", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/quiz-demo")

    const checkButton = page.locator(".multiple-choice-check-button").first()
    const showSolutionButton = page
      .locator(".multiple-choice-show-button")
      .first()

    await expect(checkButton).toBeVisible()
    await expect(showSolutionButton).toBeVisible()

    await expect(checkButton).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)"
    )
    await expect(checkButton).toHaveCSS("border-color", "rgb(117, 0, 20)")
    await expect(checkButton).toHaveCSS("color", "rgb(117, 0, 20)")

    await expect(showSolutionButton).toHaveCSS(
      "background-color",
      "rgb(117, 0, 20)"
    )
    await expect(showSolutionButton).toHaveCSS(
      "border-color",
      "rgb(117, 0, 20)"
    )
    await expect(showSolutionButton).toHaveCSS("color", "rgb(255, 255, 255)")
  })

  test("Table cell text does not use red link color", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const tableCell = page
      .locator("#course-content-section th, #course-content-section td")
      .first()
    await expect(tableCell).toBeVisible()
    await expect(tableCell).not.toHaveCSS("color", "rgb(163, 31, 52)")
  })
})
