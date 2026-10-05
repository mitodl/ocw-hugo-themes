import { test, expect } from "@playwright/test"
import { offlineV3FileUrl, expectLocalPackageHref } from "../util"

/**
 * file://-only: the gallery's markup, lightbox and warning dialog are covered
 * by the unified image-gallery-v3.spec.ts (siteAlias "course-v3-offline",
 * served over HTTP). This file exists only to verify that the URLs resolve
 * against the package as it is actually opened from disk, which the
 * HTTP-served test cannot exercise — every site is served from one shared
 * root there, so a relative path that climbs too high lands back inside that
 * root and still resolves.
 */
test.describe("offline-v3 image gallery — file:// path resolution", () => {
  test("image gallery page loads", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/pages/image-gallery-v3"))

    expect(page.url()).toContain("pages/image-gallery-v3/index.html")
    await expect(page.locator("body")).toContainText("Image Gallery")
  })

  test("gallery images and links are package-local", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/pages/image-gallery-v3"))

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

  test("a credit link in a nested page's gallery resolves inside the package", async ({
    page
  }) => {
    // The child page sits a level deeper than the /resources/<name>/ page a
    // credit's resource_link would be built against if it were rendered in the
    // resource's context rather than the gallery page's.
    await page.goto(offlineV3FileUrl("/pages/gallery-section/gallery-child"))

    const href = await page
      .locator("a.image-gallery__link")
      .first()
      .evaluate(link =>
        link
          .querySelector<HTMLTemplateElement>("template")!
          .content.querySelector(".image-gallery__credit a")!
          .getAttribute("href")
      )
    expect(new URL(href!, page.url()).href).toBe(
      offlineV3FileUrl("/pages/first-test-page-title")
    )
  })

  test("a section page's inlined galleries resolve inside the package", async ({
    page
  }) => {
    // show_section_pages renders each child page's content inline, a level
    // shallower than the child it was rendered for, so every relative path in
    // it comes out one ../ too deep unless the section page corrects it.
    await page.goto(offlineV3FileUrl("/pages/gallery-section"))
    const packageRoot = offlineV3FileUrl("/").replace(/index\.html$/, "")

    const urls = await page
      .locator("a.image-gallery__link")
      .evaluateAll(links =>
        links.flatMap(link => [
          link.getAttribute("href")!,
          link.querySelector("img")!.getAttribute("src")!,
          ...Array.from(
            link
              .querySelector<HTMLTemplateElement>("template")
              ?.content.querySelectorAll("a[href]") ?? []
          ).map(a => a.getAttribute("href")!)
        ])
      )
    // Relative paths only: a credit can link off-site, and that is meant to
    // leave the package.
    const relative = urls.filter(url => !/^[a-z][a-z\d+.-]*:/i.test(url))
    expect(relative.length).toBeGreaterThan(0)
    for (const url of relative) {
      expect(new URL(url, page.url()).href.startsWith(packageRoot), url).toBe(
        true
      )
    }

    const creditHref = await page
      .locator("a.image-gallery__link")
      .first()
      .evaluate(link =>
        link
          .querySelector<HTMLTemplateElement>("template")!
          .content.querySelector(".image-gallery__credit a")!
          .getAttribute("href")
      )
    expect(new URL(creditHref!, page.url()).href).toBe(
      offlineV3FileUrl("/pages/first-test-page-title")
    )
  })

  test("gallery uses v3 offline bundle", async ({ page }) => {
    await page.goto(offlineV3FileUrl("/pages/image-gallery-v3"))

    await expect(page.locator('script[src*="course_offline_v3"]')).toHaveCount(
      1
    )
  })

  test("shortcode resource links on shortcode-demos are package-local", async ({
    page
  }) => {
    await page.goto(offlineV3FileUrl("/pages/shortcode-demos"))

    const resourceLink = page.getByRole("link", {
      name: "Resource link to First Test Page"
    })
    const href = await expectLocalPackageHref(resourceLink)
    expect(href).toContain("first-test-page-title/index.html")
  })
})
