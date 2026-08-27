import { test, expect } from "@playwright/test"
import { CoursePage, expectTriggerToOpenANewTab } from "../util"

/**
 * Coverage for the server-rendered image gallery and its <dialog> lightbox.
 *
 * v3 online had no gallery spec at all before this, and course-v3 overrides
 * resource_url.html (it strips the leading courses/<slug>/ segment and prepends
 * the Hugo baseURL path), so a URL-shape regression here would be invisible
 * everywhere else.
 */
test.describe("v3 image gallery", () => {
  test("renders semantic figures with correctly resolved URLs", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    const figures = page.locator(".image-gallery .image-gallery__figure")
    await expect(figures).toHaveCount(3)

    const firstImage = figures.first().locator("img.image-gallery__thumb")
    const src = await firstImage.getAttribute("src")
    expect(src).toBe(
      "https://live-qa.ocw.mit.edu/courses/o/ocw-ci-test-course/example_jpg.jpg"
    )

    // Fastly variants come from picture_element.html, not from JS.
    const srcset = await firstImage.getAttribute("srcset")
    expect(srcset).toContain("format=auto&quality=75&width=1920 1920w")

    // The href is the unparameterized original, which is what the no-JS path
    // navigates to and what the lightbox falls back to when srcset is empty.
    await expect(
      figures.first().locator("a.image-gallery__link")
    ).toHaveAttribute("href", src!)

    // Deliberately no fetch of `src`: test-sites ships no image bytes, so a
    // status assertion would only be testing live-QA's content, not this code.
    // The exact-URL assertion above is the actual resource_url regression guard.
  })

  test("every gallery link has an accessible name", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    // The first item's resource has an empty image-alt, so the shortcode falls
    // back to labelling the link from data-ngdesc.
    await expect(page.getByRole("link", { name: "A pretty dog" })).toBeVisible()

    // The second item has real image-alt, which names the link via the img.
    await expect(
      page.getByRole("link", { name: "A diagram of a test pattern" })
    ).toBeVisible()

    // The third item's href is a hashed ocw-studio filename
    // ("<uid>_2.Niepce.jpg") with no text/data-ngdesc param, so its accessible
    // name must come entirely from the resource resolved via that hashed href.
    await expect(
      page.getByRole("link", {
        name: "A faint grayscale image of a rooftop and outbuildings."
      })
    ).toBeVisible()
  })

  test("credit renders as a real link rather than attribute text", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    const credit = page.locator(".image-gallery__credit a")
    await expect(credit).toHaveAttribute("href", "https://google.com")
    await expect(credit).toHaveAccessibleName("Google (opens in a new tab)")
  })

  test("resolves credit, caption, and alt from the resource when the href is a hashed ocw-studio filename", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    // Real ocw-studio content authors this href as "<uid-without-dashes>_<filename>"
    // ("c3e2834174a42a89c56c3a1a5bcc0eff_2.Niepce.jpg"), which never basenames to
    // match the resource's own filename ("2.Niepce.jpg"). Regression coverage for
    // the lookup bug where image_resource_index.html only keyed on filename, so
    // credit/caption/alt silently rendered empty for every real gallery item.
    const figures = page.locator(".image-gallery .image-gallery__figure")
    const thirdFigure = figures.nth(2)

    await expect(
      thirdFigure.locator("img.image-gallery__thumb")
    ).toHaveAttribute(
      "alt",
      "A faint grayscale image of a rooftop and outbuildings."
    )
    await expect(
      thirdFigure.locator(".image-gallery__caption-text")
    ).toHaveText(
      "An 1826 heliograph, believed to be the oldest surviving camera photograph."
    )
    await expect(thirdFigure.locator(".image-gallery__credit")).toHaveText(
      "Courtesy of the Harry Ransom Center, University of Texas at Austin."
    )
  })

  test("opens as a modal dialog from the keyboard and announces the slide", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    const link = page.getByRole("link", { name: "A pretty dog" })
    await link.focus()
    await page.keyboard.press("Enter")

    const dialog = page.locator("dialog.image-gallery-lightbox")
    await expect(dialog).toBeVisible()
    // :modal is what gives us the focus trap and the inert background.
    expect(await dialog.evaluate(el => el.matches(":modal"))).toBe(true)
    await expect(dialog).toHaveAttribute("aria-label", "Image viewer")

    // The live region must be populated *after* showModal(); a write made while
    // the dialog is still display:none is never announced.
    // The first item has no image-alt, so the description half is empty.
    await expect(page.locator(".image-gallery-lightbox__status")).toHaveText(
      /^Image 1 of 3\./
    )
    await expect(page.locator(".image-gallery-lightbox__counter")).toHaveText(
      "1 / 3"
    )
  })

  test("makes the page behind inert and returns focus to the trigger", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    const link = page.getByRole("link", { name: "A pretty dog" })
    await link.click()

    const dialog = page.locator("dialog.image-gallery-lightbox")
    await expect(dialog).toBeVisible()

    // Deliberately not simulating Tab. Tab's focus-navigation is a browser
    // default action that needs the OS window focused, which is unreliable when
    // Playwright runs workers in parallel — it made this test flaky. The
    // containment guarantee is better checked directly: while a dialog is
    // :modal, the top layer makes everything behind it refuse focus.
    const backgroundTookFocus = await page.evaluate(() => {
      const behind = document.querySelector<HTMLAnchorElement>(
        "a.image-gallery__link"
      )!
      behind.focus()
      return document.activeElement === behind
    })
    expect(backgroundTookFocus).toBe(false)

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    // Regression test for the Safari focus bug: activating a link does not focus
    // it there, so the component focuses it explicitly before showModal().
    await expect(link).toBeFocused()
  })

  test("arrow keys move between slides and re-announce", async ({ page }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    await page.getByRole("link", { name: "A pretty dog" }).click()

    const image = page.locator(".image-gallery-lightbox__image")
    await expect(image).toHaveAttribute("src", /example_jpg\.jpg$/)

    await page.keyboard.press("ArrowRight")
    await expect(image).toHaveAttribute("src", /image1\.png$/)
    await expect(page.locator(".image-gallery-lightbox__counter")).toHaveText(
      "2 / 3"
    )
    await expect(page.locator(".image-gallery-lightbox__status")).toHaveText(
      "Image 2 of 3. A diagram of a test pattern"
    )

    await page.keyboard.press("ArrowRight")
    await expect(image).toHaveAttribute("src", /2\.Niepce\.jpg$/)
    await expect(page.locator(".image-gallery-lightbox__counter")).toHaveText(
      "3 / 3"
    )
    await expect(page.locator(".image-gallery-lightbox__status")).toHaveText(
      "Image 3 of 3. A faint grayscale image of a rooftop and outbuildings."
    )

    // Wraps rather than dead-ending.
    await page.keyboard.press("ArrowRight")
    await expect(image).toHaveAttribute("src", /example_jpg\.jpg$/)
  })

  test("clicking a credit link does not open the lightbox", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    // The external-link modal intercepts the navigation, so this is safe to click.
    await page.locator(".image-gallery__credit a").click()

    await expect(page.locator("dialog.image-gallery-lightbox")).toHaveCount(0)
  })

  test("a credit link inside the lightbox opens its warning modal above the dialog", async ({
    page
  }) => {
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    await page.getByRole("link", { name: "A pretty dog" }).click()
    await expect(page.locator("dialog.image-gallery-lightbox")).toBeVisible()

    // Regression test for two bugs together: an earlier version flattened the
    // credit's anchor to plain text before painting it into the lightbox (so
    // there was nothing to click), and even with the anchor preserved, the
    // warning modal it opens is normally a descendant of <body> — outside the
    // open dialog's top layer, where the dialog's own showModal() semantics
    // make it inert. If either regresses, this click hangs and the test times
    // out rather than reaching the modal at all.
    const creditLink = page.locator(".image-gallery-lightbox__caption a")
    await expect(creditLink).toHaveAccessibleName("Google (opens in a new tab)")
    await creditLink.click()

    const warningDialog = page.getByRole("dialog", {
      name: "You are leaving MIT OpenCourseWare"
    })
    await expect(warningDialog).toBeVisible()

    const continueButton = page.getByRole("button", { name: "Continue" })
    await expectTriggerToOpenANewTab(
      page,
      "https://www.google.com/",
      continueButton
    )
  })

  test("works with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    const course = new CoursePage(page, "course-v3")
    await course.goto("/pages/image-gallery", { waitUntil: "domcontentloaded" })

    // No lightbox, but the figure is still rendered and the link still points at
    // the full image — progressive enhancement rather than a hard dependency.
    await expect(
      page.locator(".image-gallery .image-gallery__figure")
    ).toHaveCount(3)
    await expect(page.locator("a.image-gallery__link").first()).toHaveAttribute(
      "href",
      /example_jpg\.jpg$/
    )

    await context.close()
  })
})
