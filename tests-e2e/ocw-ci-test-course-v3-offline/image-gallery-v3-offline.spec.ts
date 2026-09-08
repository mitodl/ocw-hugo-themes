import { test, expect } from "@playwright/test"
import { offlineFileUrl, expectLocalPackageHref } from "../util"

test.describe("offline-v3 image gallery page", () => {
  test("image gallery page loads", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    expect(page.url()).toContain("pages/image-gallery/index.html")
    await expect(page.locator("body")).toContainText("Image Gallery")
  })

  test("image gallery container is present", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    const gallery = page.locator(".image-gallery")
    await expect(gallery).toBeVisible()
  })

  test("gallery data-base-url is a local relative path", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    const gallery = page.locator(".image-gallery")
    const baseUrl = await gallery.getAttribute("data-base-url")

    expect(baseUrl).toBeTruthy()
    // Must not be an absolute http URL — must be local/relative
    expect(baseUrl).not.toMatch(/^https?:\/\//)
  })

  test("gallery items are server-rendered figures", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    // The markup no longer depends on JS to exist, which matters offline: the
    // package is opened over file:// where bundle URLs may not resolve.
    const figures = page.locator(".image-gallery .image-gallery__figure")
    await expect(figures).toHaveCount(3)
  })

  test("gallery images and links are package-local", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    const link = page.locator("a.image-gallery__link").first()
    const href = await expectLocalPackageHref(link)
    expect(href).toContain("static_resources/example_jpg.jpg")

    const src = await page
      .locator("img.image-gallery__thumb")
      .first()
      .getAttribute("src")
    expect(src).toContain("static_resources/example_jpg.jpg")
    expect(src).not.toMatch(/^https?:\/\//)

    // picture_element.html skips Fastly optimization for relative paths, so
    // offline serves the original file with no srcset. Parity with the old
    // behaviour, not a regression.
    const srcset = await page
      .locator("img.image-gallery__thumb")
      .first()
      .getAttribute("srcset")
    expect(srcset).toBeNull()
  })

  test("gallery links carry an accessible name", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    // Asserted as attached rather than visible: these pages are opened over
    // file:// with no stylesheet loaded (the bundle path resolves above the test
    // output dir), so images have no intrinsic size and collapse to a zero box.
    // First item's resource has an empty image-alt, so the link is labelled from
    // data-ngdesc; the second is named by its real alt text.
    await expect(
      page.getByRole("link", { name: "A pretty dog", includeHidden: true })
    ).toHaveCount(1)
    await expect(
      page.getByRole("link", {
        name:          "A diagram of a test pattern",
        includeHidden: true
      })
    ).toHaveCount(1)
  })

  test("gallery uses v3 offline bundle", async ({ page }) => {
    await page.goto(offlineFileUrl("/pages/image-gallery"))

    await expect(page.locator('script[src*="course_offline_v3"]')).toHaveCount(
      1
    )
  })

  test("shortcode resource links on shortcode-demos are package-local", async ({
    page
  }) => {
    await page.goto(offlineFileUrl("/pages/shortcode-demos"))

    const resourceLink = page.getByRole("link", {
      name: "Resource link to First Test Page"
    })
    const href = await expectLocalPackageHref(resourceLink)
    expect(href).toContain("first-test-page-title/index.html")
  })
})
