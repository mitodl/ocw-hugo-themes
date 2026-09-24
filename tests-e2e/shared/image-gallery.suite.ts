import { test, expect } from "../util/fixtures"
import { CoursePage, TEST_SITES, expectTriggerToOpenANewTab } from "../util"
import type { TestSiteAlias } from "../util"

/**
 * The image-gallery suite, shared by course-v2 and course-v3.
 *
 * Both themes render galleries with the same base-theme shortcodes and the same
 * lightbox, so the same behaviour is asserted for both. Each theme's gallery
 * spec just calls imageGallerySuite(), and the siteAlias fixture runs it against
 * the online and offline build of that theme — eight projects in all. The file
 * is named .suite.ts so no project, and not jest, collects it directly.
 *
 * Offline builds legitimately differ in one way: an image URL is relative to the
 * page rather than absolute, and picture_element.html builds Fastly variants
 * only for src values starting http://, https:// or /, so there is no srcset.
 *
 * Path resolution as a package is actually opened from disk is a separate
 * concern, covered over file:// by the offline-only gallery specs.
 */

const isOffline = (siteAlias: TestSiteAlias) =>
  siteAlias === "course-offline" || siteAlias === "course-v3-offline"

/**
 * The absolute URL an online build gives an image. RESOURCE_BASE_URL is
 * hard-coded to live-qa for the test builds (see LocalOcw), and each theme's
 * resource_url.html roots the path at that site's own base path:
 * courses/ocw-ci-test-course for v2, courses/o/ocw-ci-test-course for v3.
 */
const onlineImageUrl = (siteAlias: TestSiteAlias, file: string) =>
  `https://live-qa.ocw.mit.edu/${TEST_SITES[siteAlias].basePath}/${file}`

export function imageGallerySuite(): void {
  test.describe("image gallery", () => {
    test("renders a thumbnail rail with correctly resolved URLs", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      const items = page.locator(".image-gallery a.image-gallery__link")
      await expect(items).toHaveCount(3)

      const firstImage = items.first().locator("img.image-gallery__thumb")
      const src = await firstImage.getAttribute("src")
      const srcset = await firstImage.getAttribute("srcset")

      if (isOffline(siteAlias)) {
        // The offline package has to carry its own copy of every image, so the
        // URL is relative to the page rather than absolute, and
        // picture_element.html only builds Fastly variants for src values
        // starting http://, https:// or / — a relative one gets no srcset at
        // all. That is the intended offline shape, not a missing optimization.
        expect(src).not.toMatch(/^https?:\/\//)
        expect(src).not.toMatch(/^\//)
        expect(src).toContain("static_resources/example_jpg.jpg")
        expect(srcset).toBeNull()
      } else {
        expect(src).toBe(onlineImageUrl(siteAlias, "example_jpg.jpg"))

        // Fastly variants come from picture_element.html, not from JS.
        expect(srcset).toContain("format=auto&quality=75&width=1920 1920w")
      }

      // The href is the unparameterized original, which is what the no-JS path
      // navigates to and what the lightbox loads. True in both builds.
      await expect(items.first()).toHaveAttribute("href", src!)

      // Deliberately no fetch of `src`: test-sites ships no image bytes, so a
      // status assertion would only be testing live-QA's content, not this code.
      // The exact-URL assertion above is the actual resource_url regression guard.
    })

    test("falls back to the resource's file when the item has no href", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      // The second item is authored with an empty href and a uuid pointing at
      // image1.png. What an item authors wins, so only an item with no href at
      // all takes its URL from the resource the uuid resolves to.
      const second = page.locator(".image-gallery a.image-gallery__link").nth(1)
      if (isOffline(siteAlias)) {
        const href = await second.getAttribute("href")
        expect(href).not.toMatch(/^https?:\/\//)
        expect(href).toContain("static_resources/image1.png")
      } else {
        await expect(second).toHaveAttribute(
          "href",
          onlineImageUrl(siteAlias, "image1.png")
        )
      }

      // The alt text exists only on that resource, so this also proves the
      // metadata came from the same lookup.
      await expect(second.locator("img")).toHaveAttribute(
        "alt",
        "A diagram of a test pattern"
      )
    })

    test("shows no caption or credit in the grid", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      // They live in an inert <template> and surface only in the lightbox. Using
      // a template rather than a visually-hidden figcaption keeps the sighted and
      // screen-reader views of the grid identical — the link's own accessible
      // name is what identifies it, and that is asserted separately below.
      await expect(page.locator(".image-gallery__caption-text")).toHaveCount(0)
      await expect(page.locator(".image-gallery__credit")).toHaveCount(0)
      await expect(
        page.locator(".image-gallery template.image-gallery__caption-data")
      ).toHaveCount(3)
    })

    test("no stray text node takes up a grid cell", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      // The fixture deliberately carries a line of non-breaking spaces between
      // two items, the shape ocw-studio authoring leaves behind. The grid spec
      // wraps a run of child text in an anonymous grid item unless it is
      // entirely white space, and U+00A0 is not white space for that rule — so
      // unsanitised it renders as an empty cell in the middle of the gallery.
      // Compared by code point, not by a \\u00A0 escape or a literal character:
      // prettier rewrites the escape into the raw character, which is then both
      // invisible in review and a no-irregular-whitespace lint error.
      const NBSP = 0x00a0
      const strays = await page
        .locator(".image-gallery")
        .first()
        .evaluate(
          (grid, nbsp) =>
            [...grid.childNodes].filter(
              n =>
                n.nodeType === Node.TEXT_NODE &&
                [...(n.textContent ?? "")].some(c => c.charCodeAt(0) === nbsp)
            ).length,
          NBSP
        )
      expect(strays).toBe(0)

      // …and the items themselves survived the sanitising.
      await expect(
        page.locator(".image-gallery a.image-gallery__link")
      ).toHaveCount(3)
    })

    test("arrow keys keep working after focus has been in the caption", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).click()

      const counter = page.locator(".image-gallery-lightbox__counter-glyph")
      await expect(counter).toHaveText("1 / 3")

      // Focus the credit link, as clicking it or tabbing to it would.
      await page.locator(".image-gallery-lightbox__caption a").focus()

      // Changing slide replaces the caption and destroys that link. Focus used
      // to fall to <body>, outside the dialog, after which key events no longer
      // reached the dialog's keydown handler — the first press worked and every
      // later one did nothing.
      for (const expected of ["2 / 3", "3 / 3", "1 / 3"]) {
        await page.keyboard.press("ArrowRight")
        await expect(counter).toHaveText(expected)
        expect(
          await page.evaluate(() =>
            document
              .querySelector("dialog.image-gallery-lightbox")!
              .contains(document.activeElement)
          )
        ).toBe(true)
      }
    })

    test("carries no nanogallery2 bootstrap", async ({ page, siteAlias }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      // The wrapper used to emit a data-base-url for nanogallery2 to build image
      // URLs from, and an inline <script> calling window.initNanogallery2. Items
      // now carry fully resolved URLs and the lightbox needs no init pass, so
      // every build — both themes, online and offline — should have neither.
      await expect(page.locator(".image-gallery").first()).not.toHaveAttribute(
        "data-base-url"
      )
      expect(await page.content()).not.toContain("initNanogallery2")
      expect(
        await page.evaluate(
          () => (window as unknown as Record<string, unknown>).initNanogallery2
        )
      ).toBeUndefined()
    })

    test("every gallery link has an accessible name", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      // The first item's resource has an empty image-alt, so the shortcode falls
      // back to labelling the link from data-ngdesc.
      await expect(
        page.getByRole("link", { name: "A pretty dog" })
      ).toBeVisible()

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

    test("credit is stored as real markup rather than attribute text", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      // Read inside the template: its content is a parsed but inert fragment, so
      // the anchor is a real element the lightbox can adopt. Escaping it into a
      // data-* attribute is what used to flatten it into unclickable text.
      const creditHref = await page
        .locator(".image-gallery a.image-gallery__link")
        .first()
        .evaluate(link =>
          link
            .querySelector<HTMLTemplateElement>("template")!
            .content.querySelector("a")!
            .getAttribute("href")
        )
      expect(creditHref).toBe("https://google.com")
    })

    test("uses the authored href over the resource's own file, and still finds its metadata", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      // The third item's href keeps ocw-studio's "<uid-without-dashes>_" prefix
      // while its resource's `file` is the bare "2.Niepce.jpg", and it has no
      // uuid. Two rules meet here: the URL follows the href as authored, not the
      // resource's file; and the metadata lookup still finds the resource, via
      // the uid in the href's leading 32 hex characters.
      const third = page.locator(".image-gallery a.image-gallery__link").nth(2)
      const hashed = "c3e2834174a42a89c56c3a1a5bcc0eff_2.Niepce.jpg"
      if (isOffline(siteAlias)) {
        const href = await third.getAttribute("href")
        expect(href).toContain(`static_resources/${hashed}`)
      } else {
        await expect(third).toHaveAttribute(
          "href",
          onlineImageUrl(siteAlias, hashed)
        )
      }

      await expect(third.locator("img.image-gallery__thumb")).toHaveAttribute(
        "alt",
        "A faint grayscale image of a rooftop and outbuildings."
      )
      const stored = await third.evaluate(link => {
        const fragment =
          link.querySelector<HTMLTemplateElement>("template")!.content
        return {
          caption: fragment.querySelector(".image-gallery__caption-text")
            ?.textContent,
          credit: fragment.querySelector(".image-gallery__credit")?.textContent
        }
      })
      expect(stored.caption).toBe(
        "An 1826 heliograph, believed to be the oldest surviving camera photograph."
      )
      expect(stored.credit).toBe(
        "Courtesy of the Harry Ransom Center, University of Texas at Austin."
      )
    })

    test("prefers the item's text param, falling back to the resource caption", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      const captionOf = (index: number) =>
        page
          .locator(".image-gallery a.image-gallery__link")
          .nth(index)
          .evaluate(
            link =>
              link
                .querySelector<HTMLTemplateElement>("template")
                ?.content.querySelector(".image-gallery__caption-text")
                ?.textContent ?? null
          )

      // What the item authors wins. Item 2's text="Second image" beats its
      // resource's own "A caption from image metadata"...
      expect(await captionOf(1)).toBe("Second image")
      expect(await captionOf(0)).toBe("A dog having fun")

      // ...and only an item with no text falls back to the resource's caption.
      expect(await captionOf(2)).toBe(
        "An 1826 heliograph, believed to be the oldest surviving camera photograph."
      )
    })

    test("opens as a modal dialog from the keyboard and announces the slide", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

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
      // The first item has no image-alt, so its name comes from its aria-label.
      await expect(page.locator(".image-gallery-lightbox__status")).toHaveText(
        /^Image 1 of 3\./
      )
      await expect(
        page.locator(".image-gallery-lightbox__counter-glyph")
      ).toHaveText("1 / 3")
    })

    test("makes the page behind inert and returns focus to the trigger", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

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

    test("leaves nothing behind once closed", async ({ page, siteAlias }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      const heightBefore = await page.evaluate(
        () => document.documentElement.scrollHeight
      )

      await page.getByRole("link", { name: "A pretty dog" }).click()
      await expect(page.locator("dialog.image-gallery-lightbox")).toBeVisible()
      await page.keyboard.press("Escape")

      // `dialog.open === false` is not enough, and asserting only that is how
      // this shipped broken once: the dialog styles itself `display: flex` for
      // its column layout, and an unconditional rule beat the user agent's
      // `dialog:not([open]) { display: none }` — author origin wins over UA
      // whatever the specificity. The closed dialog stayed rendered as a
      // viewport-sized block at the foot of the page, and because its controls
      // are position: fixed the arrows hung over the document permanently.
      const after = await page.evaluate(() => {
        const d = document.querySelector<HTMLDialogElement>(
          "dialog.image-gallery-lightbox"
        )!
        const next = d.querySelector(".image-gallery-lightbox__next")!
        return {
          open:      d.open,
          display:   getComputedStyle(d).display,
          height:    document.documentElement.scrollHeight,
          arrowBox:  next.getBoundingClientRect().width,
          dialogBox: d.getBoundingClientRect().width
        }
      })

      expect(after.open).toBe(false)
      expect(after.display).toBe("none")
      // display: none collapses every box in the subtree, fixed ones included.
      expect(after.dialogBox).toBe(0)
      expect(after.arrowBox).toBe(0)
      // The stray dialog added its own full height to the page.
      expect(after.height).toBe(heightBefore)
    })

    test("arrow keys move between slides and re-announce", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      await page.getByRole("link", { name: "A pretty dog" }).click()

      const image = page.locator(".image-gallery-lightbox__image")
      await expect(image).toHaveAttribute("src", /example_jpg\.jpg$/)

      await page.keyboard.press("ArrowRight")
      await expect(image).toHaveAttribute("src", /image1\.png$/)
      await expect(
        page.locator(".image-gallery-lightbox__counter-glyph")
      ).toHaveText("2 / 3")
      await expect(page.locator(".image-gallery-lightbox__status")).toHaveText(
        "Image 2 of 3. A diagram of a test pattern"
      )

      await page.keyboard.press("ArrowRight")
      await expect(image).toHaveAttribute("src", /2\.Niepce\.jpg$/)
      await expect(
        page.locator(".image-gallery-lightbox__counter-glyph")
      ).toHaveText("3 / 3")
      await expect(page.locator(".image-gallery-lightbox__status")).toHaveText(
        "Image 3 of 3. A faint grayscale image of a rooftop and outbuildings."
      )

      // Wraps rather than dead-ending.
      await page.keyboard.press("ArrowRight")
      await expect(image).toHaveAttribute("src", /example_jpg\.jpg$/)
    })

    test("the stage yields the vertical axis to the browser", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).click()

      // pan-y is what lets the swipe listeners stay passive: the browser keeps
      // vertical panning (which the dialog needs at 400% zoom, where it becomes
      // a scroll container) while the horizontal axis goes to the gesture. If
      // this regresses to `none` the dialog stops scrolling; to `auto`, a
      // sideways drag triggers the browser's own back/forward overscroll.
      await expect(page.locator(".image-gallery-lightbox__stage")).toHaveCSS(
        "touch-action",
        "pan-y"
      )
    })

    test("swiping moves between slides on a touch device", async ({
      browser,
      browserName,
      siteAlias
    }) => {
      // page.touchscreen.tap() emits touchstart + touchend with no touchmove, so
      // it cannot express a swipe. CDP gives a genuine one, and CDP is Chromium
      // only — the gesture logic itself is covered cross-browser by the unit
      // tests in base-theme/assets/js/image_gallery_lightbox.test.ts.
      test.skip(browserName !== "chromium", "needs CDP for a real touch drag")

      const context = await browser.newContext({ hasTouch: true })
      const page = await context.newPage()
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).click()

      const image = page.locator(".image-gallery-lightbox__image")
      await expect(image).toHaveAttribute("src", /example_jpg\.jpg$/)

      const stage = await page
        .locator(".image-gallery-lightbox__stage")
        .boundingBox()
      const y = stage!.y + stage!.height / 2
      const cdp = await context.newCDPSession(page)
      const drag = async (fromX: number, toX: number) => {
        await cdp.send("Input.dispatchTouchEvent", {
          type:        "touchStart",
          touchPoints: [{ x: fromX, y }]
        })
        // Intermediate points: the handler decides the gesture's axis from
        // touchmove, so a start-to-end jump would never establish one.
        for (const x of [fromX + (toX - fromX) / 2, toX]) {
          await cdp.send("Input.dispatchTouchEvent", {
            type:        "touchMove",
            touchPoints: [{ x, y }]
          })
        }
        await cdp.send("Input.dispatchTouchEvent", {
          type:        "touchEnd",
          touchPoints: []
        })
      }

      const right = stage!.x + stage!.width - 40
      const left = stage!.x + 40

      await drag(right, left)
      await expect(image).toHaveAttribute("src", /image1\.png$/)
      await expect(
        page.locator(".image-gallery-lightbox__counter-glyph")
      ).toHaveText("2 / 3")
      await expect(page.locator(".image-gallery-lightbox__status")).toHaveText(
        "Image 2 of 3. A diagram of a test pattern"
      )

      // Back the other way.
      await drag(left, right)
      await expect(image).toHaveAttribute("src", /example_jpg\.jpg$/)
      await expect(
        page.locator(".image-gallery-lightbox__counter-glyph")
      ).toHaveText("1 / 3")

      // The buttons remain: the swipe is an addition, not a replacement, which
      // is what keeps this compliant with 2.5.1 Pointer Gestures.
      await expect(
        page.getByRole("button", { name: "Next image" })
      ).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Previous image" })
      ).toBeVisible()

      await context.close()
    })

    test("a credit link inside the lightbox is not treated as a slide", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      await page.getByRole("link", { name: "A pretty dog" }).click()
      const counter = page.locator(".image-gallery-lightbox__counter-glyph")
      await expect(counter).toHaveText("1 / 3")

      // The delegated listener matches a.image-gallery__link specifically; a
      // plain a[href] would have advanced the gallery from under the reader.
      // The external-link modal intercepts the navigation, so this is safe.
      await page.locator(".image-gallery-lightbox__caption a").click()

      await expect(counter).toHaveText("1 / 3")
      await expect(page.locator("dialog.image-gallery-lightbox")).toHaveCount(1)
    })

    test("a credit link inside the lightbox opens its warning modal above the dialog", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      await page.getByRole("link", { name: "A pretty dog" }).click()
      await expect(page.locator("dialog.image-gallery-lightbox")).toBeVisible()

      // Regression test for two bugs together: an earlier version flattened the
      // credit's anchor to plain text before painting it into the lightbox (so
      // there was nothing to click), and a Bootstrap modal under <body> is inert
      // while a modal <dialog> is open, so it could not be reached at all. The
      // course themes make the warning its own <dialog>: nested modals stack in
      // the top layer. If either regresses, this click hangs and the test times out.
      const creditLink = page.locator(".image-gallery-lightbox__caption a")
      await expect(creditLink).toHaveAccessibleName(
        "Google (opens in a new tab)"
      )
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

    test("the warning makes the gallery behind it inert", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).click()

      const counter = page.locator(".image-gallery-lightbox__counter-glyph")
      await expect(counter).toHaveText("1 / 3")
      await page.locator(".image-gallery-lightbox__caption a").click()
      await expect(
        page.getByRole("dialog", { name: "You are leaving MIT OpenCourseWare" })
      ).toBeVisible()

      // The warning is a modal <dialog> of its own, so the browser makes
      // everything below it — the lightbox included — inert. Previously the
      // warning was re-parented *into* the lightbox, which put it inside the
      // lightbox's DOM subtree, and arrow keys typed at the warning bubbled
      // into the gallery's own handler and changed slide behind it.
      await page.keyboard.press("ArrowRight")
      await expect(counter).toHaveText("1 / 3")
      expect(
        await page.evaluate(() => {
          const next = document.querySelector<HTMLButtonElement>(
            ".image-gallery-lightbox__next"
          )!
          next.focus()
          return document.activeElement === next
        })
      ).toBe(false)
    })

    test("dismissing the warning returns focus and revives the arrows", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).click()

      const creditLink = page.locator(".image-gallery-lightbox__caption a")
      await creditLink.click()
      await page.keyboard.press("Escape")

      // close() on a <dialog> restores focus to whatever was focused when it
      // opened. Bootstrap 4 only does that for [data-toggle="modal"] triggers,
      // which this never was — so focus used to land on <body>, outside the
      // lightbox, and its arrow handler stopped seeing key events entirely.
      await expect(creditLink).toBeFocused()
      await expect(
        page.getByRole("dialog", { name: "You are leaving MIT OpenCourseWare" })
      ).toBeHidden()

      await page.keyboard.press("ArrowRight")
      await expect(
        page.locator(".image-gallery-lightbox__counter-glyph")
      ).toHaveText("2 / 3")
    })

    test("the warning reads at the page's own text colour", async ({
      page,
      siteAlias
    }) => {
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).click()
      await page.locator(".image-gallery-lightbox__caption a").click()

      // Bootstrap sets no colour on .modal-content, so the old re-parented modal
      // inherited the lightbox's near-white #f7f9fb and rendered white on white
      // — about 1.05:1. As its own dialog it is no longer a child of the
      // lightbox, and the colour is set explicitly rather than inherited.
      const bodyColor = await page.evaluate(
        () => getComputedStyle(document.body).color
      )
      for (const sel of [".modal-body", ".btn-outline-primary"]) {
        await expect(page.locator(`#external-link-modal ${sel}`)).toHaveCSS(
          "color",
          bodyColor
        )
      }
    })

    test("works with JavaScript disabled", async ({ browser, siteAlias }) => {
      const context = await browser.newContext({ javaScriptEnabled: false })
      const page = await context.newPage()
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery", {
        waitUntil: "domcontentloaded"
      })

      // No lightbox, but the thumbnails are still rendered and each link still
      // points at the full image — progressive enhancement rather than a hard
      // dependency. (Caption and credit are unreachable without JS, since they
      // live in a template the lightbox reads.)
      await expect(
        page.locator(".image-gallery a.image-gallery__link")
      ).toHaveCount(3)
      await expect(
        page.locator("a.image-gallery__link").first()
      ).toHaveAttribute("href", /example_jpg\.jpg$/)

      await context.close()
    })
  })
}
