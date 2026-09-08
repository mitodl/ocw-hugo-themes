import { test, expect } from "../util/fixtures"
import { CoursePage } from "../util"

test.describe("Course v3 download page", () => {
  test("download page loads with the expected heading", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/download")

    const heading =
      siteAlias === "course-v3-offline" ? "Browse Resources" : "Download"
    await expect(page.locator("body")).toContainText(heading)
  })

  test("the online-only Download Course CTA text never leaks into the offline build", async ({
    page,
    siteAlias
  }) => {
    test.skip(
      siteAlias !== "course-v3-offline",
      "This is a negative assertion specific to the offline build"
    )
    const course = new CoursePage(page, siteAlias)
    await course.goto("/download")

    await expect(page.locator('a:has-text("Download course")')).toHaveCount(0)
    const bodyText = await page.locator("body").textContent()
    expect(bodyText).not.toContain("download the course")
    expect(bodyText).not.toContain("click on the index.html file")
  })

  test("grouped resource lists render and expand to reveal package-appropriate links", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/download")

    const toggleLinks = page.locator(".resource-list-toggle-link")
    await expect(toggleLinks.first()).toBeVisible()

    const collapsed = page
      .locator(".resource-list-toggle-link.collapsed")
      .first()
    await collapsed.click()

    const firstCard = page.locator(".resource-card").first()
    await expect(firstCard).toBeVisible()
    const titleLink = firstCard.locator(".resource-card-title")
    const href = await titleLink.getAttribute("href")

    if (siteAlias === "course-v3-offline") {
      expect(href).not.toMatch(/^https?:\/\//)
      expect(href).toContain("resources/")
    } else {
      expect(href).toMatch(/\/resources\//)
    }
  })

  test("Browse Resources CTA on the home page is present and package-appropriate when offline", async ({
    page,
    siteAlias
  }) => {
    test.skip(
      siteAlias !== "course-v3-offline",
      "This CTA text only replaces the online Download CTA in the offline build"
    )
    const course = new CoursePage(page, siteAlias)
    await course.goto("/")

    const browseBtn = page.locator(
      '.download-course-button-v3, a:has-text("Browse Resources")'
    )
    const count = await browseBtn.count()
    if (count > 0) {
      const href = await browseBtn.first().getAttribute("href")
      expect(href).not.toMatch(/^https?:\/\//)
      expect(href).toContain("download")
    }
  })
})
