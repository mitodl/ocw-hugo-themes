import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("External resource in nav opens external link", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto()

  const expandButton = page.getByRole("button", {
    name: "Subsections for External Resources"
  })
  await expandButton.click()

  const link = page.getByRole("link", { name: "Google.com" })
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute("href", "https://google.com")

  link.click()
  await page.waitForURL("https://www.google.com/", { waitUntil: "commit" })
})

test("External resource in page opens external link", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/external-resources-page")

  const link = page
    .locator("#course-content-section")
    .getByRole("link", { name: "Google.com" })

  link.click()
  await page.waitForURL("https://www.google.com/", { waitUntil: "commit" })
})

test("Broken external resource opens backup_url", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/external-resources-page")

  const link = page.getByRole("link", { name: "broken external resource" })

  link.click()
  await page.waitForURL("https://www.youtube.com/", { waitUntil: "commit" })
})
