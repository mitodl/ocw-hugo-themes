/**
 * Accessible image-gallery lightbox built on the native <dialog> element.
 *
 * showModal() supplies the four things every third-party lightbox we audited got
 * wrong: a focus trap, Escape to close, a genuinely inert background (via the top
 * layer, not an aria-hidden sweep), and focus restored to the trigger on close.
 * What this module adds is the part none of them provided — a polite live region,
 * an accessible name on the dialog, and real alt text.
 *
 * The gallery markup is rendered server-side by
 * course-v3/layouts/shortcodes/image-gallery-item.html, so this file constructs no
 * URLs: it reuses the thumbnail's own srcset and only overrides `sizes`.
 *
 * One dialog per document, built on first open, driven by a single delegated
 * listener. There is no init pass over the DOM and no cached slide list.
 */

const DIALOG_CLASS = "image-gallery-lightbox"
const LINK_SELECTOR = "a.image-gallery__link"
const GALLERY_SELECTOR = ".image-gallery"

interface Slide {
  href: string
  alt: string
  srcset: string
  captionHtml: string
}

interface Lightbox {
  dialog: HTMLDialogElement
  image: HTMLImageElement
  caption: HTMLElement
  counter: HTMLElement
  status: HTMLElement
  prev: HTMLButtonElement
  next: HTMLButtonElement
}

let lightbox: Lightbox | null = null
let slides: Slide[] = []
let current = 0
let listening = false

/**
 * Every browser in the project's browserslist supports modal <dialog>, but check
 * anyway: without showModal() there is no focus trap, and a non-modal dialog is
 * worse for keyboard users than simply following the link.
 */
function supportsModalDialog(): boolean {
  return (
    typeof window.HTMLDialogElement === "function" &&
    typeof window.HTMLDialogElement.prototype.showModal === "function"
  )
}

/** Read a slide out of the server-rendered markup. */
function toSlide(link: HTMLAnchorElement): Slide {
  const img = link.querySelector("img")
  // The caption lives in a sibling <figcaption>. Its markup is reused as-is —
  // including any credit link — rather than flattened to text, so the credit
  // stays a real, focusable link inside the lightbox too. A credit link is
  // still an external-link-warning link, and external_link_modal.ts is what
  // makes that warning visible above this dialog's top layer.
  const figure = link.closest("figure")
  const figcaption = figure?.querySelector("figcaption")
  return {
    href:        link.getAttribute("href") || "",
    alt:         img?.getAttribute("alt") || "",
    srcset:      img?.getAttribute("srcset") || "",
    captionHtml: figcaption?.innerHTML.trim() || ""
  }
}

function build(): Lightbox {
  const dialog = document.createElement("dialog")
  dialog.className = DIALOG_CLASS
  // Without a name the dialog announces only as "dialog".
  dialog.setAttribute("aria-label", "Image viewer")
  dialog.innerHTML = `
    <p class="image-gallery-lightbox__counter"></p>
    <div class="image-gallery-lightbox__stage">
      <img class="image-gallery-lightbox__image" alt="" />
    </div>
    <div class="image-gallery-lightbox__bar">
      <p class="image-gallery-lightbox__caption"></p>
    </div>
    <p class="image-gallery-lightbox__status sr-only" role="status" aria-live="polite"></p>
    <button class="image-gallery-lightbox__button image-gallery-lightbox__close" type="button" aria-label="Close image viewer" autofocus>
      <span class="material-icons" aria-hidden="true">close</span>
    </button>
    <button class="image-gallery-lightbox__button image-gallery-lightbox__prev" type="button" aria-label="Previous image">
      <span class="material-icons" aria-hidden="true">chevron_left</span>
    </button>
    <button class="image-gallery-lightbox__button image-gallery-lightbox__next" type="button" aria-label="Next image">
      <span class="material-icons" aria-hidden="true">chevron_right</span>
    </button>`
  document.body.appendChild(dialog)

  const box: Lightbox = {
    dialog,
    image:   dialog.querySelector(".image-gallery-lightbox__image")!,
    caption: dialog.querySelector(".image-gallery-lightbox__caption")!,
    counter: dialog.querySelector(".image-gallery-lightbox__counter")!,
    status:  dialog.querySelector(".image-gallery-lightbox__status")!,
    prev:    dialog.querySelector(".image-gallery-lightbox__prev")!,
    next:    dialog.querySelector(".image-gallery-lightbox__next")!
  }

  box.prev.addEventListener("click", () => go(current - 1))
  box.next.addEventListener("click", () => go(current + 1))
  dialog
    .querySelector(".image-gallery-lightbox__close")!
    .addEventListener("click", () => dialog.close())

  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      go(current - 1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      go(current + 1)
    }
  })

  // Clicking the backdrop (the dialog element itself) dismisses. Escape already
  // covers this for keyboard users, courtesy of showModal().
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close()
  })

  // The dialog is reused, so stale status text would still be there on reopen and
  // an identical value is not a mutation — meaning no announcement. Clear it.
  dialog.addEventListener("close", () => {
    box.status.textContent = ""
  })

  return box
}

/**
 * Paint slide `index` (wrapping at both ends) without touching the live region,
 * and return the text that describes it.
 */
function paint(index: number): string {
  const box = lightbox!
  current = (index + slides.length) % slides.length
  const slide = slides[current]
  const { image, caption, counter, prev, next } = box

  // Assign sizes and srcset before src so candidate selection runs once against a
  // complete set. srcset is cleared explicitly: offline builds serve unoptimized
  // relative paths with no srcset, and a stale value would win.
  image.sizes = slide.srcset ? "100vw" : ""
  image.srcset = slide.srcset
  image.src = slide.href
  image.alt = slide.alt

  caption.innerHTML = slide.captionHtml
  caption.hidden = !slide.captionHtml
  counter.textContent = `${current + 1} / ${slides.length}`

  // hidden, not disabled: a disabled button is still announced and still occupies
  // its target area, when for a single image the control does not exist at all.
  const single = slides.length < 2
  prev.hidden = single
  next.hidden = single

  return `Image ${current + 1} of ${slides.length}. ${slide.alt}`
}

/** Move to slide `index` while the dialog is already open. */
function go(index: number): void {
  if (!lightbox || slides.length === 0) return
  lightbox.status.textContent = paint(index)
}

function open(link: HTMLAnchorElement, gallery: Element): void {
  const links = Array.from(
    gallery.querySelectorAll<HTMLAnchorElement>(LINK_SELECTOR)
  )
  slides = links.map(toSlide)
  if (slides.length === 0) return

  // Rebuild if the cached dialog is no longer in the document. Anything that
  // replaces body content (a React re-render, a test resetting the DOM) detaches
  // it, and a detached dialog opens invisibly — the lightbox would just stop
  // working with no error.
  if (!lightbox || !lightbox.dialog.isConnected) lightbox = build()

  // Focus the link before showModal(). Clicking a link does not focus it in
  // Safari, and preventDefault() stops that too, so without this the dialog has
  // no element to restore focus to and closing drops focus onto <body>.
  link.focus({ preventScroll: true })

  const message = paint(Math.max(0, links.indexOf(link)))
  lightbox.dialog.showModal()

  // Write the live region only once the dialog is open. A closed <dialog> is
  // display:none, so an update made before showModal() lands in an unrendered
  // subtree and is never announced — and making it visible afterwards is not a
  // mutation, so it would never be announced at all.
  lightbox.status.textContent = message
}

/**
 * Attach the gallery lightbox. Safe to call more than once and before the DOM is
 * ready: the listener is delegated on `document` and slides are read at click
 * time.
 */
export function initImageGalleryLightbox(): void {
  // Idempotent: a second call would otherwise add a duplicate listener and open
  // the dialog twice per click.
  if (listening) return
  listening = true

  document.addEventListener("click", event => {
    // Let modified clicks (new tab, new window, download) behave normally.
    if (
      event.defaultPrevented ||
      (event as MouseEvent).button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    const target = event.target as Element | null
    // Match the gallery link specifically. A plain a[href] would also catch the
    // credit links inside <figcaption> and treat them as slides.
    const link = target?.closest<HTMLAnchorElement>(LINK_SELECTOR)
    if (!link) return

    const gallery = link.closest(GALLERY_SELECTOR)
    if (!gallery) return

    // No modal support means no focus trap, which is worse than no lightbox. Fall
    // through without preventDefault so the href opens the full image instead.
    if (!supportsModalDialog()) return

    event.preventDefault()
    open(link, gallery)
  })
}
