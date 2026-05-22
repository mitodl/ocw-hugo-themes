import { test, expect } from "@playwright/test"
import { offlineV2FileUrl } from "../util/offline-build"

test("Image gallery container has data-base-url attribute", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/pages/image-gallery"))
  const gallery = page.locator(".image-gallery[data-base-url]").first()
  await expect(gallery).toBeAttached()
})

test("Gallery data-base-url is not absolute", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/pages/image-gallery"))
  const gallery = page.locator(".image-gallery[data-base-url]").first()
  await expect(gallery).toBeAttached()
  const baseUrl = await gallery.getAttribute("data-base-url")
  expect(baseUrl).not.toBeNull()
  expect(baseUrl).not.toMatch(/^https?:\/\//)
})

test("Gallery data-base-url is not root-relative", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/pages/image-gallery"))
  const gallery = page.locator(".image-gallery[data-base-url]").first()
  await expect(gallery).toBeAttached()
  const baseUrl = await gallery.getAttribute("data-base-url")
  expect(baseUrl).not.toBeNull()
  expect(baseUrl).not.toMatch(/^\//)
})

test("Gallery data-base-url references static_resources", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/pages/image-gallery"))
  const gallery = page.locator(".image-gallery[data-base-url]").first()
  await expect(gallery).toBeAttached()
  const baseUrl = await gallery.getAttribute("data-base-url")
  expect(baseUrl).toContain("static_resources")
})
