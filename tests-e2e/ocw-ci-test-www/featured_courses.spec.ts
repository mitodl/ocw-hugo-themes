import { test, expect } from "@playwright/test"
import { WwwPage } from "../util"

test("Course Card lists Instructors", async ({ page }) => {
  const www = new WwwPage(page)
  await www.goto()
  const card = (
    await www.getCourseCard("OCW CI Test Course", { expectedCount: 6 })
  ).first()
  await expect(card).toContainText(
    "Instructors: Prof. Tester One, Dr. Tester Two, Another Tester Three"
  )
})
