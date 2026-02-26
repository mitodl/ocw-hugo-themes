import { test, expect } from "@playwright/test"
import { CoursePage } from "../util"

test.describe("MIT Learn Header", () => {
  test("Header is visible and contains MIT Learn logo", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    const header = page.locator("#mit-learn-header")
    await expect(header).toBeVisible()

    const logo = header.locator(".mit-learn-logo").first()
    await expect(logo).toBeVisible()
    await expect(logo).toHaveAttribute("alt", "MIT Learn")
  })

  test("Header contains MIT logo linking to mit.edu", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    const mitLogoLink = page.locator(".mit-logo-link").first()
    await expect(mitLogoLink).toHaveAttribute("href", "https://mit.edu/")
    await expect(mitLogoLink).toHaveAttribute("target", "_blank")
  })

  test("Search button links to search page", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    const searchButton = page.locator(".mit-learn-search-button").first()
    await expect(searchButton).toBeVisible()
    // Check that href ends with /search (base URL may vary by environment)
    await expect(searchButton).toHaveAttribute("href", /\/search$/)
  })

  test("Menu button opens navigation drawer", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    const navDrawer = page.locator("#mit-learn-nav-drawer")
    await expect(navDrawer).toHaveAttribute("aria-hidden", "true")

    // Click menu button (desktop or mobile depending on viewport)
    const menuButton = page.locator(".mit-learn-menu-button").first()
    await menuButton.click()

    await expect(navDrawer).toHaveAttribute("aria-hidden", "false")
  })

  test("Navigation drawer contains Learn section with correct links", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    // Open drawer
    const menuButton = page.locator(".mit-learn-menu-button").first()
    await menuButton.click()

    const navDrawer = page.locator("#mit-learn-nav-drawer")
    await expect(navDrawer).toHaveAttribute("aria-hidden", "false")

    // Check Learn section links - verify path patterns (base URL may vary by environment)
    const coursesLink = navDrawer.getByRole("link", {
      name: /Courses Single courses/i
    })
    await expect(coursesLink).toHaveAttribute(
      "href",
      /\/search\?resource_type=course$/
    )

    const programsLink = navDrawer.getByRole("link", {
      name: /Programs A series/i
    })
    await expect(programsLink).toHaveAttribute(
      "href",
      /\/search\?resource_type=program$/
    )

    const materialsLink = navDrawer.getByRole("link", {
      name: /Learning Materials/i
    })
    await expect(materialsLink).toHaveAttribute(
      "href",
      /\/search\?resource_type=learning_material$/
    )
  })

  test("Close button closes navigation drawer", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    // Open drawer
    const menuButton = page.locator(".mit-learn-menu-button").first()
    await menuButton.click()

    const navDrawer = page.locator("#mit-learn-nav-drawer")
    await expect(navDrawer).toHaveAttribute("aria-hidden", "false")

    // Close drawer
    const closeButton = page.locator("#mit-learn-nav-close")
    await closeButton.click()

    await expect(navDrawer).toHaveAttribute("aria-hidden", "true")
  })

  test("Clicking backdrop closes navigation drawer", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/")

    // Open drawer
    const menuButton = page.locator(".mit-learn-menu-button").first()
    await menuButton.click()

    const navDrawer = page.locator("#mit-learn-nav-drawer")
    await expect(navDrawer).toHaveAttribute("aria-hidden", "false")

    // Click backdrop
    const backdrop = page.locator("#mit-learn-nav-backdrop")
    await backdrop.click({ force: true })

    await expect(navDrawer).toHaveAttribute("aria-hidden", "true")
  })

  test("Mobile course menu is sticky and closed by default", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const mobileMenuWrapper = page.locator(".mobile-nav-div")
    const menuToggle = page.locator("#mobile-course-menu-toggle-v3")

    await expect(mobileMenuWrapper).toBeVisible()
    await expect(mobileMenuWrapper).toHaveCSS("position", "sticky")
    await expect(mobileMenuWrapper).toHaveCSS("top", "60px")
    await expect(menuToggle).toHaveAttribute("aria-expanded", "false")
  })

  test("Mobile course menu resets to closed after navigation", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/assignments")

    const menuToggle = page.locator("#mobile-course-menu-toggle-v3")
    await menuToggle.click()
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true")

    const firstLink = page.locator("#mobile-course-menu-items a").first()
    await firstLink.click()

    const nextPageMenuToggle = page.locator("#mobile-course-menu-toggle-v3")
    await expect(nextPageMenuToggle).toHaveAttribute("aria-expanded", "false")
  })
})
