import { test, expect } from '@playwright/test'
import { distFile } from '../util'

test('Course page have title in <head>', async ({ page }) => {
  await page.goto(distFile("ocw-www-ci", "index.html"))
  await expect(page).toHaveTitle("MIT OpenCourseWare | Free Online Course Materials")
})
