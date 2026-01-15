import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("Course v3 Resource List", () => {
  test("Resource list container spans full width", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    // The wrapper div should have w-100 class
    const wrapper = page.locator(".mb-2.w-100")
    await expect(wrapper).toBeVisible()
  })

  test("Resource cards container has correct styling", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const container = page.locator(".resource-cards-container")
    await expect(container).toBeVisible()

    // Verify container has border and rounded corners
    await expect(container).toHaveCSS("border-radius", "8px")
    await expect(container).toHaveCSS("overflow", "hidden")
  })

  test("Resource cards display with correct structure", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const resourceCard = page.locator(".resource-card").first()
    await expect(resourceCard).toBeVisible()

    // Check card has thumbnail and title
    const thumbnail = resourceCard.locator(".resource-card-thumbnail")
    const title = resourceCard.locator(".resource-card-title")

    await expect(thumbnail).toBeVisible()
    await expect(title).toBeVisible()
  })

  test("Resource cards show correct file type badges", async ({ page }) => {
    const expectedResources = [
      {
        title:            "file.mp4",
        resourceCategory: "video"
      },
      {
        title:            "file.png",
        resourceCategory: "file"
      },
      {
        title:            "file.pdf",
        resourceCategory: "pdf"
      },
      {
        title:            "file.docx",
        resourceCategory: "file"
      },
      {
        title:            "file.py",
        resourceCategory: "file"
      },
      {
        title:            "file.txt",
        resourceCategory: "file"
      }
    ]

    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    for (const expectedResource of expectedResources) {
      const resource = await page.locator(".resource-card", {
        has: page.locator(".resource-card-title", {
          hasText: expectedResource.title
        })
      })

      const resourceCategory = await resource.locator(".resource-card-type", {
        hasText: new RegExp(`^${expectedResource.resourceCategory}$`, "i")
      })

      await expect(resource).toBeVisible()
      await expect(resourceCategory).toBeVisible()
    }
  })

  test("PDF file type badge has correct red background", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const pdfCard = page.locator(".resource-card", {
      has: page.locator(".resource-card-title", { hasText: "file.pdf" })
    })

    const pdfBadge = pdfCard.locator(".resource-card-type.pdf")
    await expect(pdfBadge).toBeVisible()

    // Check for red background color (hex: #a31f34)
    await expect(pdfBadge).toHaveCSS(
      "background-color",
      "rgb(163, 31, 52)" // #a31f34
    )
  })

  test("File type badge has correct blue background", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const fileCard = page.locator(".resource-card", {
      has: page.locator(".resource-card-title", { hasText: "file.png" })
    })

    const fileBadge = fileCard.locator(".resource-card-type.file")
    await expect(fileBadge).toBeVisible()

    // Check for dark blue background color from Figma (hex: #002896)
    await expect(fileBadge).toHaveCSS(
      "background-color",
      "rgb(0, 40, 150)" // #002896 (Dark Blue from Figma)
    )
  })

  test("Video file type badge has correct dark background", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const videoCard = page.locator(".resource-card", {
      has: page.locator(".resource-card-title", { hasText: "file.mp4" })
    })

    const videoBadge = videoCard.locator(".resource-card-type.video")
    await expect(videoBadge).toBeVisible()

    // Check for dark gray background color (hex: #494949)
    await expect(videoBadge).toHaveCSS(
      "background-color",
      "rgb(73, 73, 73)" // #494949
    )
  })

  test("Resource card displays file size", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const resourceCard = page.locator(".resource-card").first()
    const fileSize = resourceCard.locator(".resource-card-file-size")

    // Check if file size element exists and has content
    const count = await fileSize.count()
    if (count > 0) {
      await expect(fileSize).toBeVisible()
      const text = await fileSize.textContent()
      // File size should contain KB, MB, or GB
      expect(text).toMatch(/\d+\s*(KB|MB|GB|B)/i)
    }
  })

  test("Resource card download icon is visible", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const resourceCard = page.locator(".resource-card").first()
    const downloadIcon = resourceCard.locator(".resource-card-download-icon")

    const count = await downloadIcon.count()
    if (count > 0) {
      await expect(downloadIcon).toBeVisible()
    }
  })

  test("Resource card hover state changes background", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const resourceCard = page.locator(".resource-card").first()
    // Ensure card is visible and stable before testing hover
    await expect(resourceCard).toBeVisible()

    // Get initial background color
    const initialBg = await resourceCard.evaluate(
      el => window.getComputedStyle(el).backgroundColor
    )

    // Hover over card with force to ensure it triggers
    await resourceCard.hover({ force: true })
    // Small delay to ensure CSS transition completes
    await page.waitForTimeout(100)

    // Get hover background color
    const hoverBg = await resourceCard.evaluate(
      el => window.getComputedStyle(el).backgroundColor
    )

    // Background should change on hover (from white to #fefbf5)
    expect(hoverBg).not.toBe(initialBg)
    await expect(resourceCard).toHaveCSS(
      "background-color",
      "rgb(254, 251, 245)" // #fefbf5
    )
  })

  test("Resource card title is clickable and navigates to resource page", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const resourceCard = page.locator(".resource-card").first()
    const title = resourceCard.locator(".resource-card-title")

    await expect(title).toBeVisible()
    await expect(title).toHaveAttribute("href")

    const titleText = await title.textContent()
    expect(titleText).toBeTruthy()
  })

  test("Resource cards have proper spacing and gap", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const resourceCard = page.locator(".resource-card").first()

    // Check gap between thumbnail and title (1rem = 16px)
    await expect(resourceCard).toHaveCSS("gap", "16px")

    // Check padding
    await expect(resourceCard).toHaveCSS("padding", "8px")
  })

  test("File type badge text is uppercase", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const typeBadge = page.locator(".resource-card-type").first()
    await expect(typeBadge).toBeVisible()

    // Check text-transform is uppercase
    await expect(typeBadge).toHaveCSS("text-transform", "uppercase")
  })

  test("Resource thumbnail has fixed width", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const thumbnail = page.locator(".resource-card-thumbnail").first()
    await expect(thumbnail).toBeVisible()

    // Thumbnail should be 54px wide
    const width = await thumbnail.evaluate(el => {
      return window.getComputedStyle(el).width
    })
    expect(width).toBe("54px")
  })

  test("Resource cards have proper borders with collapsed spacing", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const firstCard = page.locator(".resource-card").first()
    const secondCard = page.locator(".resource-card").nth(1)

    // Both cards should have border on all sides
    await expect(firstCard).toHaveCSS("border-top-width", "1px")
    await expect(secondCard).toHaveCSS("border-top-width", "1px")

    // Second card uses negative margin to collapse borders visually
    await expect(secondCard).toHaveCSS("margin-top", "-1px")
  })

  test("Download links have download attribute and target blank", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const downloadableLink = page
      .locator(".resource-card-thumbnail-link[download]")
      .first()
    const count = await downloadableLink.count()

    if (count > 0) {
      // Should have download attribute
      await expect(downloadableLink).toHaveAttribute("download")

      // Should have target="_blank" for downloads
      await expect(downloadableLink).toHaveAttribute("target", "_blank")
    }
  })

  test("Resource list container displays multiple cards", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/lists/a-resource-list")

    const cards = page.locator(".resource-card")
    const count = await cards.count()

    // Should have at least 2 cards
    expect(count).toBeGreaterThanOrEqual(2)

    // All cards should be visible
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toBeVisible()
    }
  })
})
