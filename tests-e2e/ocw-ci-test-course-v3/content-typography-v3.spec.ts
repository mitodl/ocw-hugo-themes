import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 content typography and spacing", () => {
  test("Body copy uses 22px line-height for 14px content text", async ({
    page,
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

  test("Paragraph blocks use 40px spacing globally", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const firstParagraph = page.locator("#course-content-section > p").first()
    const secondParagraph = page.locator("#course-content-section > p").nth(1)

    await expect(firstParagraph).toBeVisible()
    await expect(secondParagraph).toBeVisible()
    await expect(firstParagraph).toHaveCSS("margin-bottom", "0px")
    await expect(secondParagraph).toHaveCSS("margin-top", "40px")
  })

  test("First direct child of content section has no bottom margin", async ({
    page,
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const firstChild = page.locator("#course-content-section > *").first()
    await expect(firstChild).toBeVisible()
    await expect(firstChild).toHaveCSS("margin-bottom", "0px")
  })

  test("Syllabus content uses compact 8px spacing between heading and paragraphs", async ({
    page,
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/syllabus")

    const heading = page.locator("#course-content-section > h3").first()
    const firstParagraph = page.locator("#course-content-section > p").first()
    const secondParagraph = page.locator("#course-content-section > p").nth(1)
    const goalsHeading = page
      .locator("#course-content-section > h3")
      .filter({ hasText: "Goals" })

    await expect(heading).toBeVisible()
    await expect(firstParagraph).toBeVisible()
    await expect(secondParagraph).toBeVisible()
    await expect(goalsHeading).toBeVisible()
    await expect(firstParagraph).toHaveCSS("margin-top", "8px")
    await expect(goalsHeading).toHaveCSS("margin-top", "40px")
    await expect(secondParagraph).toHaveCSS("margin-top", "8px")
  })

  test("Syllabus page body carries data-page-path attribute", async ({
    page,
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/syllabus")

    const body = page.locator("body")
    const path = await body.getAttribute("data-page-path")
    expect(path).toContain("/syllabus")
  })

  test("Last table in content does not add extra bottom spacing", async ({
    page,
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const lastTable = page.locator("#course-content-section table").last()
    await expect(lastTable).toBeVisible()
    await expect(lastTable).toHaveCSS("margin-bottom", "0px")
  })

  test("Last child of content section has no bottom margin", async ({
    page,
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
    page,
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const heading = page.locator("#course-content-section h3").first()
    await expect(heading).toBeVisible()
    await expect(heading).toHaveCSS("color", "rgb(0, 0, 0)")
  })

  test("Heading inside a table cell uses black color", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const tableHeading = page
      .locator("#course-content-section th, #course-content-section td")
      .first()
    await expect(tableHeading).toBeVisible()
    // Verify table header text is not red (old h4 override removed)
    const color = await tableHeading.evaluate(
      (el) => window.getComputedStyle(el).color
    )
    // Should be black-ish, not red (#a31f34 = rgb(163, 31, 52))
    expect(color).not.toBe("rgb(163, 31, 52)")
  })
})
