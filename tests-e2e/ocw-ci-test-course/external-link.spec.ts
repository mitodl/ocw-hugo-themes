import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

const EXTERNAL_LINK_DIALOG_TITLE = "You are leaving MIT OpenCourseWare"

test("External link opens confirmation modal", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/")
  const externalLink = page.getByRole("link", { name: "An External Link" })

  await expect(externalLink).toBeVisible()

  await externalLink.click()
  const dialog = await page.getByRole("dialog", {
    name: EXTERNAL_LINK_DIALOG_TITLE
  })
  const modalTitle = await page.getByRole("heading", {
    name: EXTERNAL_LINK_DIALOG_TITLE
  })

  await expect(dialog).toBeVisible()
  await expect(modalTitle).toBeVisible()
})

test("Modal's 'continue' button navigates to the external link", async ({
  page
}) => {
  const externalLinkUrl = "https://www.google.com/"

  const course = new CoursePage(page, "course")
  await course.goto("/")
  const externalLink = page.getByRole("link", { name: "An External Link" })
  await externalLink.click()

  const continueButton = await page.getByRole("button", { name: "Continue" })
  await continueButton.click()
  await page.waitForURL(externalLinkUrl)

  await expect(page.url()).toBe(externalLinkUrl)
})

test("Modal's close buttons close modal", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/")
  const externalLink = page.getByRole("link", { name: "An External Link" })

  const closeButtonNames = ["Stay Here", "Close"]

  for (const closeButtonName of closeButtonNames) {
    await externalLink.click()

    const dialog = await page.getByRole("dialog", {
      name: EXTERNAL_LINK_DIALOG_TITLE
    })
    const modalTitle = await page.getByRole("heading", {
      name: EXTERNAL_LINK_DIALOG_TITLE
    })

    await expect(dialog).toBeVisible()
    await expect(modalTitle).toBeVisible()

    const closeButton = await page.getByRole("button", {
      name: closeButtonName
    })
    await closeButton.click()

    await expect(dialog).toBeHidden()
    await expect(modalTitle).toBeHidden()
  }
})
