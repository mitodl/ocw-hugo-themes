import { test, expect } from "@playwright/test"
import { offlineV3FileUrl, expectLocalPackageHref } from "../util"

/**
 * file://-only: real modal interaction is covered by the unified
 * external-resources-v3.spec.ts (siteAlias "course-v3-offline", served over
 * HTTP). This file exists only to verify href resolution under genuine
 * file:// opening, which the HTTP-served test cannot exercise.
 */
const EXTERNAL_RESOURCES_PAGE = "/pages/external-resources-page"

test.describe("offline-v3 external resources — file:// path resolution", () => {
  test("internal resource_link resolves to a local file:// path", async ({
    page
  }) => {
    await page.goto(offlineV3FileUrl(EXTERNAL_RESOURCES_PAGE))

    const link = page
      .locator("p")
      .filter({ hasText: "For reference" })
      .getByRole("link", { name: "First Test Page (internal link)" })

    const href = await expectLocalPackageHref(link)
    expect(href).not.toMatch(/^https?:\/\//)
  })

  test("external-link-modal markup is present in the static HTML", async ({
    page
  }) => {
    await page.goto(offlineV3FileUrl(EXTERNAL_RESOURCES_PAGE))

    const modal = page.locator("#external-link-modal")
    await expect(modal).toBeAttached()
    await expect(modal).toHaveAttribute("role", "dialog")
  })
})
