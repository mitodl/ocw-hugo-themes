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

  test("Syllabus content uses compact 8px spacing between heading and paragraphs", async ({
    page
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

  test("Last table in content does not add extra bottom spacing", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/subscripts-and-superscripts")

    const lastTable = page.locator("#course-content-section table").last()
    await expect(lastTable).toBeVisible()
    await expect(lastTable).toHaveCSS("margin-bottom", "0px")
  })

  test("Content headings render with consistent color", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const heading = page.locator("#course-content-section h3").first()
    await expect(heading).toBeVisible()
    await expect(heading).toHaveCSS("color", "rgb(0, 0, 0)")
  })
})
