import { test, expect } from '@playwright/test'
import { distFile } from '../util'

test('Course page have title in <head>', async ({ page }) => {
  await page.goto(distFile("course", "index.html"))
  await expect(page).toHaveTitle(/OCW CI Test Course/)
})
