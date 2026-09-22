import { initImageGalleryLightbox } from "./image_gallery_lightbox"

/**
 * jsdom exposes HTMLDialogElement as a constructor but implements none of
 * show/showModal/close, and does not support the :modal selector. The component
 * deliberately bails when showModal is missing (a dialog without a focus trap is
 * worse than none), so these tests install a minimal stub.
 *
 * The stub records what document.activeElement was at the moment showModal ran,
 * which is what the browser uses to decide where to return focus on close.
 */
let activeElementAtOpen: Element | null = null

function stubDialog() {
  activeElementAtOpen = null
  const proto = HTMLDialogElement.prototype as unknown as Record<
    string,
    unknown
  >
  proto.showModal = function(this: HTMLDialogElement) {
    activeElementAtOpen = document.activeElement
    this.setAttribute("open", "")
  }
  proto.show = function(this: HTMLDialogElement) {
    this.setAttribute("open", "")
  }
  proto.close = function(this: HTMLDialogElement) {
    this.removeAttribute("open")
    this.dispatchEvent(new Event("close"))
  }
}

/** Build the markup the image-gallery-item shortcode renders. */
function renderGallery(
  items: {
    href: string
    alt?: string
    srcset?: string
    caption?: string
    creditHref?: string
    /** aria-label the shortcode adds when the resource has no image-alt. */
    linkLabel?: string
  }[]
): HTMLElement {
  const gallery = document.createElement("div")
  gallery.className = "image-gallery"
  gallery.innerHTML = items
    .map(item => {
      const img = `<img class="image-gallery__thumb" alt="${item.alt ?? ""}"${
        item.srcset ? ` srcset="${item.srcset}"` : ""
      } />`
      const label = item.linkLabel ? ` aria-label="${item.linkLabel}"` : ""
      if (!item.caption && !item.creditHref) {
        return `<a class="image-gallery__link" href="${item.href}"${label}>${img}</a>`
      }
      const credit = item.creditHref ?
        `<span class="image-gallery__credit"><a href="${item.creditHref}">Google</a></span>` :
        ""
      // Caption and credit ship in an inert <template> inside the link; the
      // grid renders neither. See course-v3/layouts/shortcodes/image-gallery-item.html.
      const caption = `<template class="image-gallery__caption-data"><span class="image-gallery__caption-text">${
        item.caption ?? ""
      }</span>${credit}</template>`
      return `<a class="image-gallery__link" href="${item.href}"${label}>${img}${caption}</a>`
    })
    .join("")
  document.body.appendChild(gallery)
  return gallery
}

const dialog = () =>
  document.querySelector<HTMLDialogElement>("dialog.image-gallery-lightbox")
const status = () =>
  document.querySelector<HTMLElement>(".image-gallery-lightbox__status")
const image = () =>
  document.querySelector<HTMLImageElement>(".image-gallery-lightbox__image")
const counter = () =>
  document.querySelector<HTMLElement>(".image-gallery-lightbox__counter")
const links = () =>
  Array.from(
    document.querySelectorAll<HTMLAnchorElement>("a.image-gallery__link")
  )
const stage = () =>
  document.querySelector<HTMLElement>(".image-gallery-lightbox__stage")!

/**
 * jsdom has no Touch constructor, but its TouchEventInit converter passes
 * plain objects straight through, so a literal is enough once cast.
 */
const touchAt = (x: number, y: number) =>
  ({ clientX: x, clientY: y, identifier: 0 } as unknown as Touch)

/**
 * Drive one gesture through the stage. `path` is the intermediate touchmove
 * positions; the last one is also where the finger lifts.
 */
function swipe(path: [number, number][], { fingers = 1, cancel = false } = {}) {
  const el = stage()
  const [startX, startY] = path[0]
  const touches = (x: number, y: number) =>
    fingers > 1 ? [touchAt(x, y), touchAt(x + 60, y)] : [touchAt(x, y)]

  el.dispatchEvent(
    new TouchEvent("touchstart", {
      bubbles: true,
      touches: touches(startX, startY)
    })
  )
  for (const [x, y] of path.slice(1)) {
    el.dispatchEvent(
      new TouchEvent("touchmove", { bubbles: true, touches: touches(x, y) })
    )
  }
  const [endX, endY] = path[path.length - 1]
  el.dispatchEvent(
    new TouchEvent(cancel ? "touchcancel" : "touchend", {
      bubbles:        true,
      changedTouches: [touchAt(endX, endY)]
    })
  )
}

describe("initImageGalleryLightbox", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
    stubDialog()
    initImageGalleryLightbox()
  })

  it("does nothing until a gallery link is clicked", () => {
    renderGallery([{ href: "a.jpg" }])
    expect(dialog()).toBeNull()
  })

  it("reads alt, src and caption out of the server-rendered markup", () => {
    renderGallery([
      {
        href:    "a.jpg",
        alt:     "A cantilever beam",
        srcset:  "a.jpg?width=480 480w, a.jpg?width=1920 1920w",
        caption: "Figure one"
      }
    ])
    links()[0].click()

    expect(image()!.getAttribute("alt")).toBe("A cantilever beam")
    expect(image()!.getAttribute("src")).toBe("a.jpg")
    expect(
      document.querySelector(".image-gallery-lightbox__caption")!.textContent
    ).toContain("Figure one")
  })

  it("does not carry the thumbnail's srcset into the viewer", () => {
    renderGallery([
      {
        href:   "a.jpg",
        alt:    "A cantilever beam",
        srcset: "a.jpg?width=480 480w, a.jpg?width=1920 1920w"
      }
    ])
    links()[0].click()

    // Fastly never upscales, so a "1920w" descriptor on a 500px original makes
    // the browser infer a high density and lay the image out far too small —
    // on a phone, smaller than the thumbnail. The href is the true original.
    expect(image()!.hasAttribute("srcset")).toBe(false)
    expect(image()!.hasAttribute("sizes")).toBe(false)
  })

  it("announces the trigger's accessible name when the image has no alt", () => {
    renderGallery([
      { href: "a.jpg", alt: "First" },
      { href: "b.jpg", alt: "", linkLabel: "A pretty dog" }
    ])
    links()[1].click()

    // The shortcode labels the anchor when the resource has no image-alt.
    // Reusing it here keeps the announcement informative...
    expect(status()!.textContent).toBe("Image 2 of 2. A pretty dog")
    // ...without claiming it describes the image: an empty alt is the honest
    // encoding for "no description available".
    expect(image()!.getAttribute("alt")).toBe("")
  })

  it("prefers real alt text over the trigger's label", () => {
    renderGallery([
      { href: "a.jpg", alt: "A cantilever beam", linkLabel: "ignore me" }
    ])
    links()[0].click()

    expect(status()!.textContent).toBe("Image 1 of 1. A cantilever beam")
  })

  it("keeps a credit link as a real, focusable anchor inside the lightbox caption", () => {
    renderGallery([
      {
        href:       "a.jpg",
        alt:        "First",
        caption:    "Cap",
        creditHref: "https://google.com"
      }
    ])
    links()[0].click()

    // Regression test: an earlier version read figcaption.textContent, which
    // flattened the credit's anchor to plain, unclickable text.
    const creditLink = document.querySelector<HTMLAnchorElement>(
      ".image-gallery-lightbox__caption a"
    )
    expect(creditLink).not.toBeNull()
    expect(creditLink!.getAttribute("href")).toBe("https://google.com")
  })

  it("reuses one dialog across galleries and repeat opens", () => {
    renderGallery([{ href: "a.jpg" }])
    renderGallery([{ href: "b.jpg" }])

    links()[0].click()
    dialog()!.close()
    links()[1].click()

    expect(
      document.querySelectorAll("dialog.image-gallery-lightbox")
    ).toHaveLength(1)
    expect(image()!.getAttribute("src")).toBe("b.jpg")
  })

  it("announces position and description only once the dialog is open", () => {
    renderGallery([
      { href: "a.jpg", alt: "First" },
      { href: "b.jpg", alt: "Second" }
    ])
    links()[0].click()

    // Regression test: an earlier version wrote the live region before
    // showModal(), which lands in a display:none subtree and is never announced.
    expect(dialog()!.hasAttribute("open")).toBe(true)
    expect(status()!.textContent).toBe("Image 1 of 2. First")
  })

  it("focuses the link before opening, so focus can be restored on close", () => {
    renderGallery([{ href: "a.jpg", alt: "First" }])
    const link = links()[0]
    link.click()

    // Safari does not focus a link on click, and preventDefault suppresses it
    // too, so the component focuses it explicitly first.
    expect(activeElementAtOpen).toBe(link)
  })

  describe("swipe", () => {
    const openThreeSlideGallery = () => {
      renderGallery([
        { href: "a.jpg", alt: "First" },
        { href: "b.jpg", alt: "Second" },
        { href: "c.jpg", alt: "Third" }
      ])
      links()[0].click()
    }

    it("advances on a swipe left and goes back on a swipe right", () => {
      openThreeSlideGallery()

      swipe([
        [200, 100],
        [140, 104],
        [80, 106]
      ])
      expect(counter()!.textContent).toBe("2 / 3")

      swipe([
        [80, 100],
        [140, 96],
        [200, 98]
      ])
      expect(counter()!.textContent).toBe("1 / 3")
    })

    it("wraps at both ends, like the arrows do", () => {
      openThreeSlideGallery()

      swipe([
        [200, 100],
        [80, 100]
      ])
      swipe([
        [200, 100],
        [80, 100]
      ])
      expect(counter()!.textContent).toBe("3 / 3")
      swipe([
        [200, 100],
        [80, 100]
      ])
      expect(counter()!.textContent).toBe("1 / 3")
    })

    it("announces the new slide, so a swipe is not a silent change", () => {
      openThreeSlideGallery()

      swipe([
        [200, 100],
        [80, 100]
      ])
      expect(status()!.textContent).toBe("Image 2 of 3. Second")
    })

    it("does nothing when the drag is too short to be deliberate", () => {
      openThreeSlideGallery()

      // Under both the 40px bar and the 20px flick floor. Releasing short is
      // how a user aborts, which is what 2.5.2 Pointer Cancellation asks for.
      swipe([
        [200, 100],
        [188, 100]
      ])
      expect(counter()!.textContent).toBe("1 / 3")
    })

    it("still accepts a short, fast flick", () => {
      openThreeSlideGallery()

      // 25px: under the 40px bar but over the 20px flick floor, and a
      // synthetic gesture takes ~0ms, so it is inside the 300ms window.
      swipe([
        [200, 100],
        [175, 100]
      ])
      expect(counter()!.textContent).toBe("2 / 3")
    })

    it("leaves a vertical drag to the scroller", () => {
      openThreeSlideGallery()

      // Travels far enough horizontally to clear the threshold, but it is
      // mostly vertical — at 400% zoom this is someone scrolling the dialog.
      swipe([
        [200, 100],
        [180, 180],
        [155, 300]
      ])
      expect(counter()!.textContent).toBe("1 / 3")
    })

    it("ignores a two-finger gesture, so pinch-zoom cannot change slides", () => {
      openThreeSlideGallery()

      swipe(
        [
          [200, 100],
          [80, 100]
        ],
        { fingers: 2 }
      )
      expect(counter()!.textContent).toBe("1 / 3")
    })

    it("abandons the gesture on touchcancel", () => {
      openThreeSlideGallery()

      swipe(
        [
          [200, 100],
          [80, 100]
        ],
        { cancel: true }
      )
      expect(counter()!.textContent).toBe("1 / 3")
    })

    it("does not arm for a single-image gallery", () => {
      renderGallery([{ href: "only.jpg", alt: "Only" }])
      links()[0].click()

      // The arrows are hidden in this case, so a swipe re-announcing the same
      // slide would be noise.
      swipe([
        [200, 100],
        [80, 100]
      ])
      expect(counter()!.textContent).toBe("1 / 1")
      expect(status()!.textContent).toBe("Image 1 of 1. Only")
    })
  })

  it("wraps at both ends when navigating", () => {
    renderGallery([
      { href: "a.jpg", alt: "First" },
      { href: "b.jpg", alt: "Second" }
    ])
    links()[0].click()

    const next = document.querySelector<HTMLButtonElement>(
      ".image-gallery-lightbox__next"
    )!
    const prev = document.querySelector<HTMLButtonElement>(
      ".image-gallery-lightbox__prev"
    )!

    next.click()
    expect(counter()!.textContent).toBe("2 / 2")
    next.click()
    expect(counter()!.textContent).toBe("1 / 2")
    prev.click()
    expect(counter()!.textContent).toBe("2 / 2")
  })

  it("opens at the clicked image, not the first one", () => {
    renderGallery([
      { href: "a.jpg", alt: "First" },
      { href: "b.jpg", alt: "Second" },
      { href: "c.jpg", alt: "Third" }
    ])
    links()[2].click()

    expect(counter()!.textContent).toBe("3 / 3")
    expect(status()!.textContent).toBe("Image 3 of 3. Third")
  })

  it("hides rather than disables the arrows for a single image", () => {
    renderGallery([{ href: "a.jpg", alt: "Only" }])
    links()[0].click()

    const prev = document.querySelector<HTMLButtonElement>(
      ".image-gallery-lightbox__prev"
    )!
    const next = document.querySelector<HTMLButtonElement>(
      ".image-gallery-lightbox__next"
    )!
    // A disabled button is still announced and still occupies its target area.
    expect(prev.hidden).toBe(true)
    expect(next.hidden).toBe(true)
    expect(prev.disabled).toBe(false)
  })

  it("holds the image back until its own bitmap is what would be painted", () => {
    renderGallery([
      { href: "a.jpg", alt: "First" },
      { href: "b.jpg", alt: "Second" }
    ])
    links()[0].click()
    dialog()!.close()
    links()[1].click()

    // Regression test: the dialog is one reused element, so without this the
    // first painted frame of a reopen was the previous slide's bitmap sitting
    // under the new slide's caption and counter.
    expect(
      image()!.classList.contains("image-gallery-lightbox__image--loading")
    ).toBe(true)
    // Hidden with opacity, so the alt text stays in the accessibility tree.
    expect(image()!.getAttribute("alt")).toBe("Second")

    image()!.dispatchEvent(new Event("load"))
    expect(
      image()!.classList.contains("image-gallery-lightbox__image--loading")
    ).toBe(false)
  })

  it("reveals a broken image so its alt text is shown", () => {
    renderGallery([{ href: "gone.jpg", alt: "Missing" }])
    links()[0].click()

    image()!.dispatchEvent(new Event("error"))
    expect(
      image()!.classList.contains("image-gallery-lightbox__image--loading")
    ).toBe(false)
  })

  it("keeps focus in the dialog when the caption it is in is replaced", () => {
    renderGallery([
      {
        href:       "a.jpg",
        alt:        "First",
        caption:    "Cap",
        creditHref: "https://g.co"
      },
      { href: "b.jpg", alt: "Second", caption: "Cap two" },
      { href: "c.jpg", alt: "Third", caption: "Cap three" }
    ])
    links()[0].click()

    const creditLink = document.querySelector<HTMLAnchorElement>(
      ".image-gallery-lightbox__caption a"
    )!
    creditLink.focus()
    expect(document.activeElement).toBe(creditLink)

    // Regression test: changing slide used to destroy the focused credit link
    // and drop focus onto <body>, outside the dialog — after which no key
    // event bubbled through the dialog's handler and the arrows were dead.
    const next = document.querySelector<HTMLButtonElement>(
      ".image-gallery-lightbox__next"
    )!
    next.click()
    expect(counter()!.textContent).toBe("2 / 3")
    expect(document.activeElement).toBe(dialog())
    expect(dialog()!.contains(document.activeElement)).toBe(true)

    // And it keeps working, rather than surviving exactly one move.
    next.click()
    expect(counter()!.textContent).toBe("3 / 3")
    next.click()
    expect(counter()!.textContent).toBe("1 / 3")
  })

  it("leaves focus alone when it is not inside the caption", () => {
    renderGallery([
      { href: "a.jpg", alt: "First", caption: "Cap" },
      { href: "b.jpg", alt: "Second", caption: "Cap two" }
    ])
    links()[0].click()

    const next = document.querySelector<HTMLButtonElement>(
      ".image-gallery-lightbox__next"
    )!
    next.focus()
    next.click()

    // Nothing was destroyed, so there is no reason to move focus off the
    // control the user is operating.
    expect(document.activeElement).toBe(next)
  })

  it("clears the live region on close so a reopen re-announces", () => {
    renderGallery([{ href: "a.jpg", alt: "First" }])
    links()[0].click()
    expect(status()!.textContent).not.toBe("")

    dialog()!.close()
    expect(status()!.textContent).toBe("")
  })

  it("renders no caption or credit into the grid", () => {
    renderGallery([
      {
        href:       "a.jpg",
        alt:        "First",
        caption:    "Cap",
        creditHref: "https://google.com"
      }
    ])

    // The <template> holding them is inert: not rendered, not in the
    // accessibility tree, and not reachable by a document query — which is
    // what keeps the sighted and screen-reader views of the grid identical.
    expect(document.querySelector(".image-gallery__caption-text")).toBeNull()
    expect(document.querySelector(".image-gallery__credit")).toBeNull()
    expect(document.querySelectorAll("a.image-gallery__link")).toHaveLength(1)
  })

  it("ignores a credit link inside the lightbox caption", () => {
    renderGallery([
      {
        href:       "a.jpg",
        alt:        "First",
        caption:    "Cap",
        creditHref: "https://g.co"
      },
      { href: "b.jpg", alt: "Second" }
    ])
    links()[0].click()
    expect(counter()!.textContent).toBe("1 / 2")

    const credit = document.querySelector<HTMLAnchorElement>(
      ".image-gallery-lightbox__caption .image-gallery__credit a"
    )!
    credit.click()

    // A plain a[href] selector would have treated this as a slide; the
    // component matches a.image-gallery__link specifically.
    expect(counter()!.textContent).toBe("1 / 2")
    expect(
      document.querySelectorAll("dialog.image-gallery-lightbox")
    ).toHaveLength(1)
  })

  it("lets modified clicks through so open-in-new-tab still works", () => {
    renderGallery([{ href: "a.jpg", alt: "First" }])
    const event = new MouseEvent("click", {
      bubbles:    true,
      cancelable: true,
      metaKey:    true
    })
    links()[0].dispatchEvent(event)

    expect(dialog()).toBeNull()
    expect(event.defaultPrevented).toBe(false)
  })

  it("falls through to the href when modal dialogs are unsupported", () => {
    const proto = HTMLDialogElement.prototype as unknown as Record<
      string,
      unknown
    >
    const saved = proto.showModal
    delete proto.showModal

    renderGallery([{ href: "a.jpg", alt: "First" }])
    const event = new MouseEvent("click", { bubbles: true, cancelable: true })
    links()[0].dispatchEvent(event)

    // No focus trap available, so navigating to the image beats a broken modal.
    expect(dialog()).toBeNull()
    expect(event.defaultPrevented).toBe(false)

    proto.showModal = saved
  })

  it("handles offline items, whose relative hrefs are already unoptimized", () => {
    renderGallery([
      { href: "../../static_resources/a.jpg", alt: "Offline", srcset: "" }
    ])
    links()[0].click()

    expect(image()!.getAttribute("src")).toBe("../../static_resources/a.jpg")
    expect(image()!.hasAttribute("srcset")).toBe(false)
  })
})
