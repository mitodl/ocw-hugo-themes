import { test, expect } from "@playwright/test"
import { CoursePage, expectTriggerToOpenANewTab } from "../util"

const EXTERNAL_LINK_DIALOG_TITLE = "You are leaving MIT OpenCourseWare"

test("Nav external resource open in a new tab", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto()

  const expandButton = page.getByRole("button", {
    name: "Subsections for External Resources"
  })
  await expandButton.click()

  const link = page.getByRole("link", { name: "Google.com" })
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute("href", "https://google.com")
  await link.click()

  const continueButton = page.getByRole("button", { name: "Continue" })

  await expectTriggerToOpenANewTab(
    page,
    "https://www.google.com/",
    continueButton
  )
})

test("Nav external resource without warning directly opens a new tab", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/external-resources-page")

  const link = page.getByRole("link", { name: "OCW (no warning)" })
  await expect(link).toBeVisible()

  const targetAttribute = await link.getAttribute("target")
  expect(targetAttribute).toBeNull()

  const classAttribute = await link.getAttribute("class")
  expect(classAttribute).not.toContain("external-link")
})

test("External resource in page opens a new tab", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/external-resources-page")

  const link = page.getByRole("link", { name: "Google.com" }).nth(1)
  await expect(link).toHaveAttribute("href", "https://google.com")
  await link.click()

  const continueButton = page.getByRole("button", { name: "Continue" })

  await expectTriggerToOpenANewTab(
    page,
    "https://www.google.com/",
    continueButton
  )
})

test("External resource opens confirmation modal", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/external-resources-page")

  const link = page
    .locator("p")
    .filter({ hasText: "This link opens a warning" })
    .getByRole("link")

  await expect(link).toBeVisible()
  await link.click()

  const dialog = await page.getByRole("dialog", {
    name: EXTERNAL_LINK_DIALOG_TITLE
  })
  const modalTitle = await page.getByRole("heading", {
    name: EXTERNAL_LINK_DIALOG_TITLE
  })

  await expect(dialog).toBeVisible()
  await expect(modalTitle).toBeVisible()
})

test("External resource without warning does not open confirmation modal", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/external-resources-page")

  const link = page
    .locator("p")
    .filter({ hasText: "This link DOES NOT open a warning" })
    .getByRole("link")

  await expect(link).toBeVisible()
  await link.click()

  const dialog = await page.getByRole("dialog", {
    name: EXTERNAL_LINK_DIALOG_TITLE
  })
  const modalTitle = await page.getByRole("heading", {
    name: EXTERNAL_LINK_DIALOG_TITLE
  })

  await expect(dialog).toBeHidden()
  await expect(modalTitle).toBeHidden()
})

test("Modal's close buttons close modal", async ({ page }) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/external-resources-page")
  const link = page
    .locator("p")
    .filter({ hasText: "This link opens a warning" })
    .getByRole("link")

  const closeButtonNames = ["Stay Here", "Close"]

  for (const closeButtonName of closeButtonNames) {
    await link.click()

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

test("Modal's continue button opens a new tab and closes the dialog", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/external-resources-page")

  const link = page
    .locator("p")
    .filter({ hasText: "This link opens a warning" })
    .getByRole("link")
  await link.click()

  const continueButton = page.getByRole("button", { name: "Continue" })
  await expectTriggerToOpenANewTab(
    page,
    "https://www.google.com/",
    continueButton
  )

  const dialog = await page.getByRole("dialog", {
    name: EXTERNAL_LINK_DIALOG_TITLE
  })
  const modalTitle = await page.getByRole("heading", {
    name: EXTERNAL_LINK_DIALOG_TITLE
  })

  await expect(dialog).toBeHidden()
  await expect(modalTitle).toBeHidden()
})
