import { test, expect } from "../util/fixtures"
import { CoursePage, expectLocalPackageHref } from "../util"

test.describe("Course v3 downloads", () => {
  test("the course ZIP and its instructions are offered only online", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/download", { waitUntil: "domcontentloaded" })
    if (siteAlias === "course-v3-offline") {
      await expect(page.locator('a:has-text("Download Course")')).toHaveCount(0)
      const body = page.locator("body")
      await expect(body).not.toContainText("download the course")
      await expect(body).not.toContainText("click on the index.html file")
      return
    }

    const zip = page.getByRole("link", { name: "Download Course", exact: true })
    await expect(zip).toBeVisible()
    await expect(zip).toHaveAttribute(
      "href",
      /\/courses\/o\/ocw-ci-test-course\/ocw-ci-test-course\.zip$/
    )
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

  test("the home page resource button opens the download page with Enter", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/", { waitUntil: "domcontentloaded" })
    const offline = siteAlias === "course-v3-offline"
    const button = page
      .getByRole("button", {
        name:  offline ? "Browse Resources" : "Download Course",
        exact: true
      })
      .first()
    if (offline) {
      await expectLocalPackageHref(button)
    }
    await button.press("Enter")
    await expect(
      page.getByRole("heading", {
        name:  offline ? "Browse Resources" : "Download",
        exact: true
      })
    ).toBeVisible()
  })
})
