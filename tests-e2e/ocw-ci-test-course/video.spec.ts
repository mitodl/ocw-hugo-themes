import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test("Download button links (download video and download transcript) should be keyboard navigable", async ({
  page,
}) => {
  const course = new CoursePage(page, "course")
  await course.goto("resources/ocw_test_course_mit8_01f16_l01v01_360p")
  const downloadButtonByRole = page.getByRole("button", {
    name: (`Download Button`),
  })
  await downloadButtonByRole.focus()
  await page.keyboard.press("Enter")

  const videoLink = page.getByRole("link", { name: "Download video" })

  await expect(videoLink).toBeVisible()

  const transcriptLink = page.getByRole("link", { name: "Download transcript" })
  await expect(transcriptLink).toBeVisible()

  await page.keyboard.press("Tab")
  await expect(videoLink).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(transcriptLink).toBeFocused()

  // Add back in any href tests you want on the links
})

