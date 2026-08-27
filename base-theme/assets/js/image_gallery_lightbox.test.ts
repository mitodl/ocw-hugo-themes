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
  }[]
): HTMLElement {
  const gallery = document.createElement("div")
  gallery.className = "image-gallery"
  gallery.innerHTML = items
    .map(item => {
      const img = `<img class="image-gallery__thumb" alt="${item.alt ?? ""}"${
        item.srcset ? ` srcset="${item.srcset}"` : ""
      } />`
      const link = `<a class="image-gallery__link" href="${item.href}">${img}</a>`
      if (!item.caption && !item.creditHref) return link
      const credit = item.creditHref ?
        `<span class="image-gallery__credit"><a href="${item.creditHref}">Google</a></span>` :
        ""
      return `<figure class="image-gallery__figure">${link}<figcaption class="image-gallery__caption"><span>${
        item.caption ?? ""
      }</span>${credit}</figcaption></figure>`
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

  it("reads alt, srcset and caption out of the server-rendered markup", () => {
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
    expect(image()!.getAttribute("srcset")).toContain("1920w")
    // sizes is overridden so the browser picks a full-screen candidate.
    expect(image()!.getAttribute("sizes")).toBe("100vw")
    expect(
      document.querySelector(".image-gallery-lightbox__caption")!.textContent
    ).toContain("Figure one")
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

  it("clears the live region on close so a reopen re-announces", () => {
    renderGallery([{ href: "a.jpg", alt: "First" }])
    links()[0].click()
    expect(status()!.textContent).not.toBe("")

    dialog()!.close()
    expect(status()!.textContent).toBe("")
  })

  it("ignores credit links inside the figcaption", () => {
    renderGallery([
      {
        href:       "a.jpg",
        alt:        "First",
        caption:    "Cap",
        creditHref: "https://google.com"
      }
    ])
    const credit = document.querySelector<HTMLAnchorElement>(
      ".image-gallery__credit a"
    )!
    credit.click()

    // A plain a[href] selector would have treated this as a slide.
    expect(dialog()).toBeNull()
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

  it("handles offline items that have no srcset", () => {
    renderGallery([
      { href: "../../static_resources/a.jpg", alt: "Offline", srcset: "" }
    ])
    links()[0].click()

    expect(image()!.getAttribute("src")).toBe("../../static_resources/a.jpg")
    expect(image()!.getAttribute("srcset")).toBe("")
    expect(image()!.getAttribute("sizes")).toBe("")
  })
})
