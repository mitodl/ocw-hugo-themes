import { test, expect } from "@playwright/test"
import { CoursePage, expectTriggerToOpenANewTab } from "../util"

test("Image gallery displays thumbnail and opens viewer with credit text", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/image-gallery")

  const thumbnailTitle = page.getByText("A dog having fun")
  await expect(thumbnailTitle).toBeVisible()

  await thumbnailTitle.click()

  const creditText = page.getByText("Distributed under the CCC.")
  await expect(creditText).toBeVisible()
})

test("Image gallery external link in credit text opens external link modal and new tab", async ({
  page
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("/pages/image-gallery")

  const thumbnailTitle = page.getByText("A dog having fun")
  await thumbnailTitle.click()

  const externalLinktoGoogle = page.locator(".nGY2Viewer").getByText("Google")
  await externalLinktoGoogle.click()

  // External link modal should open
  const modalText = page.getByText("You are leaving MIT OpenCourseWare")
  await expect(modalText).toBeVisible()

  // Click continue button and assert new tab opens
  const continueButton = page.getByRole("button", { name: "Continue" })
  await expectTriggerToOpenANewTab(
    page,
    "https://www.google.com",
    continueButton
  )

  // Assert modal is closed after clicking continue
  await expect(modalText).toBeHidden()
})
