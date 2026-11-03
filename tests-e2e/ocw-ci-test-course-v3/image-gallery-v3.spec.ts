import { Page } from "@playwright/test"
import { test, expect } from "../util/fixtures"
import { CoursePage, expectTriggerToOpenANewTab } from "../util"

/**
 * Coverage for the server-rendered image gallery and its <dialog> lightbox.
 *
 * v3 online had no gallery spec at all before this, and course-v3 overrides
 * resource_url.html (it strips the leading courses/<slug>/ segment and prepends
 * the Hugo baseURL path), so a URL-shape regression here would be invisible
 * everywhere else.
 *
 * Runs against both builds via siteAlias. The offline package ships this whole
 * feature — course-offline-v3's bundle calls initImageGalleryLightbox, and the
 * item shortcode and the native <dialog> warning modal both resolve to
 * course-v3's copies because base-offline defines neither — so the behaviour
 * below is worth asserting there too. Three tests branch, because the offline
 * build legitimately differs: relative image URLs with no Fastly srcset, and
 * base-offline's wrapper keeping the (inert) nanogallery2 bootstrap.
 *
 * Path resolution as the package is actually opened from disk is a separate
 * concern, covered over file:// by image-gallery-v3-offline.spec.ts.
 */

/** Escape every character a RegExp treats as syntax, backslash included. */
function escapeRegExp(text: string): string {
  return text.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&")
}

/**
 * What the lightbox should load for the slide whose file is `file`: online, the
 * href through Fastly's format and quality conversion (see paint() in
 * base-theme/assets/js/image_gallery_lightbox.ts); offline, the package-relative
 * href exactly as authored.
 */
const lightboxSrc = (siteAlias: string, file: string) =>
  new RegExp(
    `${escapeRegExp(file)}${
      siteAlias === "course-v3-offline" ? "" : "\\?format=auto&quality=75"
    }$`
  )

/**
 * Record what the lightbox says through its live region, the counter, from
 * before `page` first navigates: every text its spoken label is given while the
 * dialog is open. A write made while the dialog is closed lands in a
 * display:none subtree and is never announced, so it is left out (see
 * announcePosition() in image_gallery_lightbox.ts).
 */
async function recordAnnouncements(
  page: Page
): Promise<() => Promise<string[]>> {
  await page.addInitScript(() => {
    const said: string[] = []
    Object.assign(window, { __lightboxAnnouncements: said })
    let open = false
    new MutationObserver(records => {
      // Records come in the order the changes were made, so `open` says
      // whether the dialog was showing when each write happened.
      for (const { type, target } of records) {
        if (!(target instanceof HTMLElement)) continue
        if (type === "attributes") {
          if (target.matches("dialog.image-gallery-lightbox")) {
            open = target.hasAttribute("open")
          }
        } else if (
          open &&
          target.matches(".image-gallery-lightbox__counter-label") &&
          target.textContent
        ) {
          said.push(target.textContent)
        }
      }
    }).observe(document, {
      childList:       true,
      subtree:         true,
      attributeFilter: ["open"]
    })
  })
  return () =>
    page.evaluate(
      () =>
        (window as unknown as { __lightboxAnnouncements: string[] })
          .__lightboxAnnouncements
    )
}

/**
 * Serve example_jpg.jpg (the "A pretty dog" item) as an image of a known size,
 * taller than any viewport these tests use. test-sites ship no image bytes.
 */
const serveTallImage = (page: Page) =>
  page.route("**/example_jpg.jpg*", route =>
    route.fulfill({
      contentType: "image/svg+xml",
      body:
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">' +
        '<rect width="400" height="600" fill="#888"/></svg>'
    })
  )

/**
 * The reviewer's setup, Firefox on Windows at 150% display scaling, turns 200%
 * and 400% browser zoom into the first two of these CSS viewports; the third is
 * WCAG 1.4.10's own reference, 1280x1024 at 400%, and the fourth 300% of a
 * 14-inch MacBook's 1512x790 browser window. All are in the narrow layout.
 */
const ZOOMED = [
  { zoom: "200% zoom at 150% display scaling", width: 640, height: 300 },
  { zoom: "400% zoom at 150% display scaling", width: 320, height: 150 },
  { zoom: "400% zoom of a 1280x1024 screen", width: 320, height: 256 },
  { zoom: "300% zoom of a laptop window", width: 504, height: 263 }
]

/** The longest caption on PE.710, the course the reviewer tested. */
const LONG_CAPTION =
  "Step 3: The swing is completed with the follow-through. The racket ends " +
  "over the opposite shoulder, and once again attention is focused on the " +
  "opposite court in anticipation of the next shot."

test.describe("v3 image gallery", () => {
  test("renders a thumbnail rail with correctly resolved URLs", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })

    const items = page.locator(".image-gallery a.image-gallery__link")
    await expect(items).toHaveCount(3)

    const firstImage = items.first().locator("img.image-gallery__thumb")
    const src = await firstImage.getAttribute("src")
    const srcset = await firstImage.getAttribute("srcset")

    if (siteAlias === "course-v3-offline") {
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
      expect(src).toBe(
        "https://live-qa.ocw.mit.edu/courses/o/ocw-ci-test-course/example_jpg.jpg"
      )

      // Fastly variants come from picture_element.html, not from JS.
      expect(srcset).toContain("format=auto&quality=75&width=1920 1920w")
    }

    // The href is the unparameterized original, which is what the no-JS path
    // navigates to. True in both builds; the lightbox adds Fastly's format and
    // quality parameters to it online, which lightboxSrc() above checks.
    await expect(items.first()).toHaveAttribute("href", src!)

    // Deliberately no fetch of `src`: test-sites ships no image bytes, so a
    // status assertion would only be testing live-QA's content, not this code.
    // The exact-URL assertion above is the actual resource_url regression guard.
  })

  test("resolves the resource by uuid in preference to href", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })

    // The second item is authored with a uuid that points at gallery_test.png
    // and a deliberately bogus href. uuid is the pointer ocw-studio maintains
    // and it survives a rename or re-upload, so it has to win: if the lookup
    // fell back to href, the resource would miss and src would carry the bogus
    // filename with no alt text.
    const second = page.locator(".image-gallery a.image-gallery__link").nth(1)
    if (siteAlias === "course-v3-offline") {
      const href = await second.getAttribute("href")
      expect(href).not.toMatch(/^https?:\/\//)
      expect(href).toContain("static_resources/gallery_test.png")
    } else {
      await expect(second).toHaveAttribute(
        "href",
        "https://live-qa.ocw.mit.edu/courses/o/ocw-ci-test-course/gallery_test.png"
      )
    }

    // The lookup itself is identical in both theme chains, so these two carry
    // the actual regression guard: the alt text only exists on the resource
    // the uuid points at, and the bogus href must appear nowhere.
    await expect(second.locator("img")).toHaveAttribute(
      "alt",
      "A diagram of a test pattern"
    )
    expect(await page.content()).not.toContain("this-file-does-not-exist")
  })

  test("resolves only image resources, and nothing for an item with no href", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/gallery-section/gallery-child", {
      waitUntil: "domcontentloaded"
    })
    const edgeCases = page
      .locator(".image-gallery")
      .nth(1)
      .locator("a.image-gallery__link")

    // This uuid belongs to a PDF. The lookup has to skip non-image resources
    // and fall back to the href, which names a real image.
    await expect(edgeCases.nth(0)).toHaveAttribute("href", /example_jpg\.jpg$/)

    // path.Base of an empty href is ".", which used to be the index key of
    // whichever file-less page came first, so this item took that page's
    // title as its accessible name. It must resolve to nothing instead.
    await expect(edgeCases.nth(1)).toHaveAttribute(
      "aria-label",
      /^Gallery image/
    )
  })

  test("shows no caption or credit in the grid", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
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
    test.skip(
      siteAlias === "course-v3-offline",
      "v3 offline resolves to base-offline's wrapper, shared with v2 offline and left as on main, which does not collapse NBSP runs"
    )
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
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

  test("thumbnails fill their tiles rather than letterboxing", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })

    // Every tile is 4:3, so `contain` left bands of the tile's ground around
    // any image of another shape. The lightbox still shows the whole image.
    const thumbs = page.locator(".image-gallery img.image-gallery__thumb")
    await expect(thumbs).toHaveCount(3)
    for (const thumb of await thumbs.all()) {
      await expect(thumb).toHaveCSS("object-fit", "cover")
    }
  })

  test("arrow keys keep working after focus has been in the caption", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
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

  test("drops the nanogallery2 bootstrap online, keeps base-offline's offline", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })

    const gallery = page.locator(".image-gallery")

    if (siteAlias === "course-v3-offline") {
      // The offline chain is ["base-offline", "course-offline-v3",
      // "course-v3", "base-theme"], so base-offline's wrapper outranks
      // course-v3's and both hooks survive. That is deliberate and documented
      // in course-v3/layouts/shortcodes/image-gallery.html: base-offline's
      // copy has to stay for the v2 offline chain, and the cost of leaving it
      // for v3 is nil.
      await expect(gallery).toHaveAttribute("data-base-url", /.+/)
      expect(await page.content()).toContain("initNanogallery2")

      // ...nil precisely because the bundle no longer defines the global the
      // inline script calls, so the script is inert. If this ever becomes
      // defined, the offline bundle has started pulling nanogallery2 back in.
      expect(
        await page.evaluate(
          () => (window as unknown as Record<string, unknown>).initNanogallery2
        )
      ).toBeUndefined()
    } else {
      // course-v3 overrides the wrapper shortcode to drop base-theme's two
      // nanogallery2 hooks: the data-base-url it built thumbnail URLs from
      // (read only by course-v2's init script, which never loads here) and an
      // inline <script> a CSP would otherwise have to allow. base-theme keeps
      // both for course-v2.
      await expect(gallery).not.toHaveAttribute("data-base-url")
      expect(await page.content()).not.toContain("initNanogallery2")
    }
  })

  test("every gallery link has an accessible name", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })

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

  test("credit is stored as real markup rather than attribute text", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
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

  test("resolves credit, caption, and alt from the resource when the href is a hashed ocw-studio filename", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })

    // The href has ocw-studio's "<uid-without-dashes>_<filename>" shape
    // ("c3e2834174a42a89c56c3a1a5bcc0eff_2.Niepce.jpg"), but the fixture's
    // resource `file` deliberately lacks the prefix ("2.Niepce.jpg"), so the
    // bare-filename key misses. Real ocw-studio resources carry the prefix in
    // `file` too, so they match on that key; this item carries no uuid and
    // exists to exercise the uid-prefix fallback behind it.
    const third = page.locator(".image-gallery a.image-gallery__link").nth(2)

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

  test("takes the caption from the resource's image_metadata, not the item's text param", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
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

    // The caption belongs to the image, so it is read from the resource the
    // item points at rather than from the string copied into this particular
    // gallery. Item 2 is authored with text="Second image" while its
    // resource's own metadata says something else — the resource has to win,
    // otherwise two galleries showing one image could caption it differently
    // and editing the image's metadata would silently change nothing.
    expect(await captionOf(1)).toBe("A caption from image metadata")

    // Item 1 is the other half of the same rule: text="A dog having fun" but
    // example_jpg.jpg has an empty caption, so no caption element is emitted
    // at all. Its credit still is, which is what keeps the <template> present.
    expect(await captionOf(0)).toBeNull()
  })

  test("opens as a modal dialog from the keyboard and announces the slide", async ({
    page,
    siteAlias
  }) => {
    const announced = await recordAnnouncements(page)
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
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
    await expect.poll(announced).toEqual(["Image 1 of 3"])
    await expect(
      page.locator(".image-gallery-lightbox__counter-glyph")
    ).toHaveText("1 / 3")
  })

  test("reads position, Close, caption and image, then the arrows", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })
    await page
      .getByRole("link", { name: "A diagram of a test pattern" })
      .click()

    // A screen reader reads the dialog in DOM order, and this is the order an
    // accessibility review asked for. Previous and Next used to come straight
    // after Close, ahead of the image and caption they act on, so a reader who
    // had read the caption had to go back up to reach Next. A hidden
    // paragraph after them, which announced each slide, repeated the position
    // and the description; the counter is the live region now.
    await expect(page.getByRole("dialog", { name: "Image viewer" }))
      .toMatchAriaSnapshot(`
      - dialog "Image viewer":
        - /children: equal
        - status: Image 2 of 3
        - button "Close image viewer"
        - paragraph: A caption from image metadata
        - img "A diagram of a test pattern"
        - button "Previous image"
        - button "Next image"
    `)
  })

  test("makes the page behind inert and returns focus to the trigger", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
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
    await course.goto("/pages/image-gallery-v3", {
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
    const announced = await recordAnnouncements(page)
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })

    await page.getByRole("link", { name: "A pretty dog" }).click()

    const image = page.locator(".image-gallery-lightbox__image")
    await expect(image).toHaveAttribute(
      "src",
      lightboxSrc(siteAlias, "example_jpg.jpg")
    )

    await page.keyboard.press("ArrowRight")
    await expect(image).toHaveAttribute(
      "src",
      lightboxSrc(siteAlias, "gallery_test.png")
    )
    await expect(
      page.locator(".image-gallery-lightbox__counter-glyph")
    ).toHaveText("2 / 3")
    await expect.poll(announced).toContain("Image 2 of 3")

    await page.keyboard.press("ArrowRight")
    await expect(image).toHaveAttribute(
      "src",
      lightboxSrc(siteAlias, "2.Niepce.jpg")
    )
    await expect(
      page.locator(".image-gallery-lightbox__counter-glyph")
    ).toHaveText("3 / 3")
    await expect.poll(announced).toContain("Image 3 of 3")

    // Wraps rather than dead-ending.
    await page.keyboard.press("ArrowRight")
    await expect(image).toHaveAttribute(
      "src",
      lightboxSrc(siteAlias, "example_jpg.jpg")
    )
  })

  test("fits a tall image and its caption into a short viewport", async ({
    page,
    siteAlias
  }) => {
    // A landscape phone, with an image taller than the whole screen.
    await page.setViewportSize({ width: 844, height: 390 })
    await serveTallImage(page)
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })
    await page.getByRole("link", { name: "A pretty dog" }).click()

    const image = page.locator(".image-gallery-lightbox__image")
    await expect
      .poll(() =>
        image.evaluate(img => (img as HTMLImageElement).naturalHeight)
      )
      .toBe(600)

    // The image scales down to the space the caption leaves, rather than
    // pushing the caption below the fold at its natural height. The arrows
    // sit in the bottom corners of the image area, so they fit on it too.
    const imageBox = (await image.boundingBox())!
    const barBox = (await page
      .locator(".image-gallery-lightbox__bar")
      .boundingBox())!
    const nextBox = (await page
      .getByRole("button", { name: "Next image" })
      .boundingBox())!
    expect(imageBox.height).toBeLessThan(600)
    expect(barBox.y + barBox.height).toBeLessThanOrEqual(390)
    expect(nextBox.y + nextBox.height).toBeLessThanOrEqual(390)
  })

  for (const { zoom, width, height } of ZOOMED) {
    test(`at ${zoom}, no control ever sits over the caption`, async ({
      page,
      siteAlias
    }) => {
      await page.setViewportSize({ width, height })
      await serveTallImage(page)
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery-v3", {
        waitUntil: "domcontentloaded"
      })
      await page.evaluate(() => {
        document
          .querySelector<HTMLTemplateElement>("a.image-gallery__link template")!
          .content.querySelector(".image-gallery__credit")!.textContent =
          "A long credit line. ".repeat(40)
      })
      // From the keyboard: on a screen this short the page's own sticky header
      // can sit over the thumbnail and take the click.
      await page.getByRole("link", { name: "A pretty dog" }).press("Enter")
      const dialog = page.locator("dialog.image-gallery-lightbox")
      await expect(dialog).toBeVisible()

      // A caption this long cannot share the screen with the image, so the
      // dialog scrolls, which is what 1.4.10 allows...
      expect(await dialog.evaluate(d => d.scrollHeight > d.clientHeight)).toBe(
        true
      )

      // ...but the controls were position: fixed, so the caption scrolled
      // underneath them. At 320x150 one or two of its lines were covered at
      // every scroll position and could not be read at all. Check them all.
      const covered = await dialog.evaluate(d => {
        const caption = d.querySelector(".image-gallery-lightbox__caption")!
        const controls = Array.from(
          d.querySelectorAll<HTMLElement>(
            ".image-gallery-lightbox__counter, .image-gallery-lightbox__button"
          )
        ).filter(control => !control.hidden)
        // Text runs rather than element boxes: the credit is display: block,
        // so its box is full width whether or not its text reaches the edge.
        const lines = () => {
          const rects: DOMRect[] = []
          const walker = document.createTreeWalker(
            caption,
            NodeFilter.SHOW_TEXT
          )
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (!node.textContent!.trim()) continue
            const range = document.createRange()
            range.selectNodeContents(node)
            for (const rect of Array.from(range.getClientRects())) {
              if (rect.width > 1) rects.push(rect)
            }
          }
          return rects
        }
        const found: string[] = []
        for (let top = 0; top <= d.scrollHeight - d.clientHeight; top++) {
          d.scrollTop = top
          for (const control of controls) {
            const box = control.getBoundingClientRect()
            for (const line of lines()) {
              if (line.bottom <= 0 || line.top >= window.innerHeight) continue
              if (
                line.left < box.right - 0.5 &&
                box.left < line.right - 0.5 &&
                line.top < box.bottom - 0.5 &&
                box.top < line.bottom - 0.5
              ) {
                found.push(
                  `${control.className} over the line at ${Math.round(
                    line.top
                  )}px when scrolled ${top}px`
                )
              }
            }
          }
        }
        return found.slice(0, 5)
      })
      expect(covered).toEqual([])
    })

    test(`at ${zoom}, the controls sit in the corners of the image area, on the first screen`, async ({
      page,
      siteAlias
    }) => {
      await page.setViewportSize({ width, height })
      await serveTallImage(page)
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery-v3", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).press("Enter")
      await expect(page.locator("dialog.image-gallery-lightbox")).toBeVisible()

      // They used to take rows of their own here, the position and Close above
      // the image and the arrows below the caption. The top row took 64px of a
      // 150px screen at 400%, and even at 200% the arrows were a scroll away.
      // They now sit over the image area, as they do on a wide screen.
      const box = async (part: string) =>
        (await page.locator(`.image-gallery-lightbox__${part}`).boundingBox())!
      const stage = await box("stage")
      const controls = {
        counter: await box("counter"),
        close:   await box("close"),
        prev:    await box("prev"),
        next:    await box("next")
      }
      for (const control of Object.values(controls)) {
        expect(control.x).toBeGreaterThanOrEqual(stage.x)
        expect(control.x + control.width).toBeLessThanOrEqual(
          stage.x + stage.width
        )
        expect(control.y).toBeGreaterThanOrEqual(Math.max(stage.y, 0))
        expect(control.y + control.height).toBeLessThanOrEqual(
          Math.min(stage.y + stage.height, height)
        )
      }

      // Each in a corner of its own, so none can sit over another.
      const middleX = stage.x + stage.width / 2
      const middleY = stage.y + stage.height / 2
      const { counter, close, prev, next } = controls
      expect(counter.x + counter.width).toBeLessThanOrEqual(middleX)
      expect(counter.y + counter.height).toBeLessThanOrEqual(middleY)
      expect(close.x).toBeGreaterThanOrEqual(middleX)
      expect(close.y + close.height).toBeLessThanOrEqual(middleY)
      expect(prev.x + prev.width).toBeLessThanOrEqual(middleX)
      expect(prev.y).toBeGreaterThanOrEqual(middleY)
      expect(next.x).toBeGreaterThanOrEqual(middleX)
      expect(next.y).toBeGreaterThanOrEqual(middleY)

      // The position is text over the photograph now, so it brings the same
      // ground as the buttons beside it rather than depending on the pixels
      // underneath for its contrast.
      const ground = (selector: string) =>
        page
          .locator(selector)
          .evaluate(el => getComputedStyle(el).backgroundColor)
      expect(await ground(".image-gallery-lightbox__counter")).toBe(
        await ground(".image-gallery-lightbox__close")
      )
    })

    test(`at ${zoom}, the image gets most of the first screen, and the caption starts on it`, async ({
      page,
      siteAlias
    }) => {
      await page.setViewportSize({ width, height })
      await serveTallImage(page)
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery-v3", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).press("Enter")

      const image = page.locator(".image-gallery-lightbox__image")
      await expect
        .poll(() =>
          image.evaluate(img => (img as HTMLImageElement).naturalHeight)
        )
        .toBe(600)

      // All of it on screen as the viewer opens...
      const box = (await image.boundingBox())!
      expect(box.y).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height).toBeLessThanOrEqual(height + 1)
      // ...and most of that screen. The image area used to be held to 35% of
      // the viewport height, so zooming in made the picture smaller on screen
      // than at 100%: 52px of a 150px viewport.
      expect(box.height).toBeGreaterThanOrEqual(height / 2)

      // The caption starts right under it, as it does at 100%. Giving the image
      // the whole first screen instead left a reader looking at a picture with
      // no sign that a caption, or the arrows, existed below it.
      const caption = (await page
        .locator(".image-gallery-lightbox__caption")
        .boundingBox())!
      expect(caption.y).toBeLessThan(height)
    })

    test(`at ${zoom}, the buttons shrink back toward their size at 100%, down to 24px`, async ({
      page,
      siteAlias
    }) => {
      await page.setViewportSize({ width, height })
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery-v3", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).press("Enter")
      await expect(page.locator("dialog.image-gallery-lightbox")).toBeVisible()
      // Until the icon font has loaded, each button is as wide as its icon's
      // ligature name ("chevron_left").
      await page.evaluate(() => document.fonts.load('24px "Material Icons"'))

      // They were 48px at every zoom, so at 400% each took a third of a 150px
      // screen's height. Zooming in now leaves them the size they were at 100%
      // until they reach 24px, the least 2.5.8 allows a target, which at all
      // three of these sizes they already have.
      for (const button of await page
        .locator(".image-gallery-lightbox__button")
        .all()) {
        const box = (await button.boundingBox())!
        expect(box.width).toBeCloseTo(24, 0)
        expect(box.height).toBeCloseTo(24, 0)
      }
      // The position's ground keeps to their height rather than standing taller
      // than the buttons beside it.
      const counter = (await page
        .locator(".image-gallery-lightbox__counter")
        .boundingBox())!
      expect(counter.height).toBeLessThanOrEqual(24)
    })

    test(`at ${zoom}, the caption is set a size smaller than at 100%`, async ({
      page,
      siteAlias
    }) => {
      await page.setViewportSize({ width: 1280, height: 600 })
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery-v3", {
        waitUntil: "domcontentloaded"
      })
      await page.getByRole("link", { name: "A pretty dog" }).press("Enter")
      await expect(page.locator("dialog.image-gallery-lightbox")).toBeVisible()
      const sizes = () =>
        page
          .locator(".image-gallery-lightbox__caption")
          .evaluate(caption =>
            [caption, caption.querySelector(".image-gallery__credit")!].map(
              el => parseFloat(getComputedStyle(el).fontSize)
            )
          )
      const [caption, credit] = await sizes()

      // So that it leaves the image more of the screen.
      await page.setViewportSize({ width, height })
      const [zoomedCaption, zoomedCredit] = await sizes()
      expect(zoomedCaption).toBeLessThan(caption)
      expect(zoomedCredit).toBeLessThan(credit)
    })
  }

  test("from about 300% zoom, the caption shrinks with the window, down to 8px", async ({
    page,
    siteAlias
  }) => {
    await page.setViewportSize({ width: 640, height: 300 })
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })
    await page.getByRole("link", { name: "A pretty dog" }).press("Enter")
    await expect(page.locator("dialog.image-gallery-lightbox")).toBeVisible()
    const size = () =>
      page
        .locator(".image-gallery-lightbox__caption")
        .evaluate(el => parseFloat(getComputedStyle(el).fontSize))

    // 200% zoom at 150% display scaling, where a reviewer checks 1.4.4: the
    // caption keeps the 13px it has from 200% on.
    expect(await size()).toBe(13)

    // Past that it went on growing with the zoom, until at 400% a long caption
    // ran off the bottom of the screen. It now keeps to the window instead...
    await page.setViewportSize({ width: 504, height: 263 })
    expect(await size()).toBeLessThan(11)

    // ...down to 8px, which 400% zoom makes twice its 15px at 100% on screen,
    // whatever the screen.
    await page.setViewportSize({ width: 320, height: 150 })
    expect(await size()).toBe(8)
  })

  for (const { zoom, width, height } of [
    { zoom: "300%", width: 504, height: 263 },
    { zoom: "400%", width: 378, height: 198 }
  ]) {
    test(`at ${zoom} zoom of a laptop window, a long caption leaves the image most of the screen`, async ({
      page,
      siteAlias
    }) => {
      await page.setViewportSize({ width, height })
      await serveTallImage(page)
      const course = new CoursePage(page, siteAlias)
      await course.goto("/pages/image-gallery-v3", {
        waitUntil: "domcontentloaded"
      })
      // The fixture's first slide has a credit but no caption of its own.
      await page.evaluate(caption => {
        const span = (className: string, text: string) =>
          Object.assign(document.createElement("span"), {
            className,
            textContent: text
          })
        document
          .querySelector<HTMLTemplateElement>("a.image-gallery__link template")!
          .content.replaceChildren(
            span("image-gallery__caption-text", caption),
            span(
              "image-gallery__credit",
              "Credit: Photo by MIT OpenCourseWare."
            )
          )
      }, LONG_CAPTION)
      await page.getByRole("link", { name: "A pretty dog" }).press("Enter")
      const dialog = page.locator("dialog.image-gallery-lightbox")
      const image = page.locator(".image-gallery-lightbox__image")
      await expect
        .poll(() =>
          image.evaluate(img => (img as HTMLImageElement).naturalHeight)
        )
        .toBe(600)
      await page.evaluate(() => document.fonts.ready)

      // At 300% this caption took 42% of the screen; at 400% it took more than
      // the image's share, and its last lines were a scroll away.
      const bar = (await page
        .locator(".image-gallery-lightbox__bar")
        .boundingBox())!
      expect(bar.height).toBeLessThanOrEqual(height / 3)
      expect(await dialog.evaluate(d => d.scrollHeight - d.clientHeight)).toBe(
        0
      )
    })
  }

  test("on a touch screen, the narrow layout keeps full-size buttons and caption", async ({
    browser,
    siteAlias
  }) => {
    // The smaller controls and caption are for a window made narrow by zooming
    // in. A phone is narrow because it is small, and a finger needs the full
    // 48px whatever the size of the screen.
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 1280, height: 800 }
    })
    const page = await context.newPage()
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })
    await page.getByRole("link", { name: "A pretty dog" }).click()
    await expect(page.locator("dialog.image-gallery-lightbox")).toBeVisible()
    await page.evaluate(() => document.fonts.load('24px "Material Icons"'))
    const caption = page.locator(".image-gallery-lightbox__caption")
    const fontSize = () => caption.evaluate(el => getComputedStyle(el).fontSize)
    const wide = await fontSize()

    await page.setViewportSize({ width: 390, height: 844 })
    expect(await fontSize()).toBe(wide)
    for (const button of await page
      .locator(".image-gallery-lightbox__button")
      .all()) {
      const box = (await button.boundingBox())!
      expect(box.width).toBeCloseTo(48, 0)
      expect(box.height).toBeCloseTo(48, 0)
    }
    await context.close()
  })

  test("the stage yields the vertical axis and pinch-zoom to the browser", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })
    await page.getByRole("link", { name: "A pretty dog" }).click()

    // pan-y is what lets the swipe listeners stay passive: the browser keeps
    // vertical panning (which the dialog needs at 400% zoom, where it becomes
    // a scroll container) while the horizontal axis goes to the gesture. If
    // this regresses to `none` the dialog stops scrolling; to `auto`, a
    // sideways drag triggers the browser's own back/forward overscroll; to
    // bare `pan-y`, readers can no longer pinch-zoom into the image.
    await expect(page.locator(".image-gallery-lightbox__stage")).toHaveCSS(
      "touch-action",
      "pan-y pinch-zoom"
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
    const announced = await recordAnnouncements(page)
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })
    await page.getByRole("link", { name: "A pretty dog" }).click()

    const image = page.locator(".image-gallery-lightbox__image")
    await expect(image).toHaveAttribute(
      "src",
      lightboxSrc(siteAlias, "example_jpg.jpg")
    )

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

    // Across the middle of the stage, well clear of the Previous and Next
    // buttons fixed at its edges. A drag that starts close to one of them
    // does not register as a swipe even when its start point is over the
    // stage, and how close the stage's vertical centre sits to them depends
    // on the caption bar's height, so on font metrics. Anchored 40px from
    // the edges, CI's fonts put the drag within that range.
    const right = stage!.x + stage!.width * 0.75
    const left = stage!.x + stage!.width * 0.25

    await drag(right, left)
    await expect(image).toHaveAttribute(
      "src",
      lightboxSrc(siteAlias, "gallery_test.png")
    )
    await expect(
      page.locator(".image-gallery-lightbox__counter-glyph")
    ).toHaveText("2 / 3")
    await expect.poll(announced).toContain("Image 2 of 3")

    // Back the other way.
    await drag(left, right)
    await expect(image).toHaveAttribute(
      "src",
      lightboxSrc(siteAlias, "example_jpg.jpg")
    )
    await expect(
      page.locator(".image-gallery-lightbox__counter-glyph")
    ).toHaveText("1 / 3")

    // The buttons remain: the swipe is an addition, not a replacement, which
    // is what keeps this compliant with 2.5.1 Pointer Gestures.
    await expect(page.getByRole("button", { name: "Next image" })).toBeVisible()
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
    await course.goto("/pages/image-gallery-v3", {
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
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })

    await page.getByRole("link", { name: "A pretty dog" }).click()
    await expect(page.locator("dialog.image-gallery-lightbox")).toBeVisible()

    // Regression test for two bugs together: an earlier version flattened the
    // credit's anchor to plain text before painting it into the lightbox (so
    // there was nothing to click), and a Bootstrap modal under <body> is inert
    // while a modal <dialog> is open, so it could not be reached at all. v3
    // makes the warning its own <dialog>: nested modals stack in the top
    // layer. If either regresses, this click hangs and the test times out.
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

  test("the warning makes the gallery behind it inert", async ({
    page,
    siteAlias
  }) => {
    const course = new CoursePage(page, siteAlias)
    await course.goto("/pages/image-gallery-v3", {
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
    await course.goto("/pages/image-gallery-v3", {
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
    await course.goto("/pages/image-gallery-v3", {
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
    await course.goto("/pages/image-gallery-v3", {
      waitUntil: "domcontentloaded"
    })

    // No lightbox, but the thumbnails are still rendered and each link still
    // points at the full image — progressive enhancement rather than a hard
    // dependency. (Caption and credit are unreachable without JS, since they
    // live in a template the lightbox reads.)
    await expect(
      page.locator(".image-gallery a.image-gallery__link")
    ).toHaveCount(3)
    await expect(page.locator("a.image-gallery__link").first()).toHaveAttribute(
      "href",
      /example_jpg\.jpg$/
    )

    await context.close()
  })
})
