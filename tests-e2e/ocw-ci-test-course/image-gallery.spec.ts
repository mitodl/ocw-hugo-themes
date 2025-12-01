import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

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
