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
 * URLs: it loads the anchor's own href, which is the unoptimized original.
 *
 * One dialog per document, built on first open, driven by a single delegated
 * listener. There is no init pass over the DOM and no cached slide list.
 *
 * Slides can be changed three ways, and all three funnel through go(): the
 * prev/next buttons, the Left/Right arrow keys, and a horizontal swipe. The
 * swipe is strictly an addition — WCAG 2.5.1 wants a single-pointer, non-path
 * alternative to any path-based gesture, and the buttons are it.
 */

const DIALOG_CLASS = "image-gallery-lightbox"
const LINK_SELECTOR = "a.image-gallery__link"
const GALLERY_SELECTOR = ".image-gallery"
/** Applied while the <img> still holds a bitmap from some other slide. */
const LOADING_CLASS = "image-gallery-lightbox__image--loading"

/**
 * Swipe tuning. 40px matches Bootstrap 4's carousel SWIPE_THRESHOLD, which is
 * already in this bundle — one number for the whole page rather than two.
 */
const SWIPE_THRESHOLD_PX = 40
/** A flick this far, if fast enough, counts even though it is under the bar. */
const SWIPE_FLICK_PX = 20
const SWIPE_FLICK_MS = 300
/**
 * Movement below this is too small to have an axis: judging direction from
 * the first pixel or two would let noise in a vertical scroll read as
 * horizontal.
 */
const SWIPE_DEADZONE_PX = 10

interface Slide {
  href: string
  alt: string
  /**
   * What to say about this slide in the live region. Same as `alt` when the
   * resource has real alt text; otherwise the accessible name the shortcode
   * put on the trigger. Kept separate from `alt` on purpose — see toSlide.
   */
  name: string
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
  // The caption and credit are not shown in the grid; the shortcode parks them
  // in an inert <template> inside the link, and they surface only here. Its
  // markup is reused as-is rather than flattened to text, so a credit link
  // stays a real, focusable link inside the lightbox. Such a link is still an
  // external-link-warning link; in v3 its warning is itself a <dialog>, so it
  // stacks above this one in the top layer and makes this one inert while it
  // is up. See course-v3/layouts/partials/external_link_modal.html.
  const caption = link.querySelector<HTMLTemplateElement>(
    "template.image-gallery__caption-data"
  )
  const alt = img?.getAttribute("alt") || ""
  // When the resource has no image-alt the shortcode leaves alt empty and
  // labels the anchor instead, from data-ngdesc / the caption / the resource
  // title. Without picking that up here the viewer announced "Image 2 of 10."
  // and nothing else, even though the thumbnail that opened it was named.
  //
  // It feeds the live region only, never image.alt: the live region is a status
  // message, so describing the slide with caption-ish text there is fair, while
  // copying it into alt would assert it describes what the image *shows*. An
  // empty alt is the honest encoding for "no description available", and
  // faking one also hides the gap from anyone fixing the content later.
  return {
    href:        link.getAttribute("href") || "",
    alt,
    name:        alt || link.getAttribute("aria-label") || "",
    captionHtml: caption?.innerHTML.trim() || ""
  }
}

function build(): Lightbox {
  const dialog = document.createElement("dialog")
  dialog.className = DIALOG_CLASS
  // Without a name the dialog announces only as "dialog".
  dialog.setAttribute("aria-label", "Image viewer")
  // Focusable only programmatically, as somewhere for focus to land when the
  // element holding it is about to be replaced — see paint().
  dialog.setAttribute("tabindex", "-1")
  // The three buttons come before the stage and the caption bar purely for
  // focus order (2.4.3). They are position: fixed, so where they sit in the
  // DOM has no bearing on where they appear or on what paints over what —
  // verified: every box and the hit-test at each button are identical either
  // way. What it does change is the tab cycle. With the caption first, its
  // credit link was the *first* focusable in the dialog while sitting at the
  // bottom of the screen; focus starts on Close, so reaching the link meant
  // tabbing out of the dialog into the browser's own UI and back in again.
  // Controls-then-caption matches how the viewer reads top to bottom, and
  // every focusable inside the dialog is now reached before focus leaves it.
  dialog.innerHTML = `
    <p class="image-gallery-lightbox__counter"></p>
    <button class="image-gallery-lightbox__button image-gallery-lightbox__close" type="button" aria-label="Close image viewer" autofocus>
      <span class="material-icons" aria-hidden="true">close</span>
    </button>
    <button class="image-gallery-lightbox__button image-gallery-lightbox__prev" type="button" aria-label="Previous image">
      <span class="material-icons" aria-hidden="true">chevron_left</span>
    </button>
    <button class="image-gallery-lightbox__button image-gallery-lightbox__next" type="button" aria-label="Next image">
      <span class="material-icons" aria-hidden="true">chevron_right</span>
    </button>
    <div class="image-gallery-lightbox__stage">
      <img class="image-gallery-lightbox__image" alt="" />
    </div>
    <div class="image-gallery-lightbox__bar">
      <p class="image-gallery-lightbox__caption"></p>
    </div>
    <p class="image-gallery-lightbox__status sr-only" role="status" aria-live="polite"></p>`
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

  // Reveal as soon as this slide's own bitmap is what would be painted. On
  // error too, so a broken image falls back to showing its alt text rather
  // than staying invisible forever.
  const reveal = () => box.image.classList.remove(LOADING_CLASS)
  box.image.addEventListener("load", reveal)
  box.image.addEventListener("error", reveal)

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

  attachSwipe(dialog)

  // No click-to-dismiss handler here: the dialog fills the viewport, so there
  // is no ::backdrop left to click, and its children tile the whole of it —
  // stage, caption bar and the fixed controls — so a click never targets the
  // dialog element itself. Escape and the close button are the ways out.

  // The dialog is reused, so stale status text would still be there on reopen and
  // an identical value is not a mutation — meaning no announcement. Clear it.
  dialog.addEventListener("close", () => {
    box.status.textContent = ""
  })

  return box
}

/**
 * Horizontal swipe on the image area, as a shortcut for the prev/next buttons.
 *
 * Bound to the stage rather than the dialog, which is what keeps this free of
 * target exclusions: the buttons and the caption bar are *siblings* of the
 * stage, so a touch on either never reaches here. (The external-link warning
 * is a dialog of its own and makes this one inert while it is open, so it
 * cannot reach here either.)
 *
 * Every listener is passive because nothing calls preventDefault — the browser
 * behaviour that would otherwise fight the gesture (horizontal overscroll
 * back/forward) is turned off in CSS with `touch-action: pan-y`, which leaves
 * vertical panning to the browser. The dialog needs that: at 400% zoom it
 * becomes a scroll container.
 *
 * Touch events, not pointer events, for two reasons. They are touch-only by
 * construction, so a mouse drag on the image can never navigate and no
 * pointerType filtering is needed; and jsdom implements them, while it has no
 * PointerEvent at all. The cost is a stylus that emits pointer but not touch
 * events, which still has the buttons and the arrow keys.
 */
function attachSwipe(dialog: HTMLDialogElement): void {
  const stage = dialog.querySelector<HTMLElement>(
    ".image-gallery-lightbox__stage"
  )
  if (!stage) return

  let startX = 0
  let startY = 0
  let startedAt = 0
  // Disarmed the moment the gesture turns out to be something else, and not
  // re-armed until the next touchstart: a scroll must not become a swipe
  // halfway through.
  let armed = false

  stage.addEventListener(
    "touchstart",
    event => {
      // A second finger means pinch-zoom. Never a slide change.
      armed = event.touches.length === 1 && slides.length > 1
      if (!armed) return
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
      startedAt = Date.now()
    },
    { passive: true }
  )

  stage.addEventListener(
    "touchmove",
    event => {
      if (!armed) return
      if (event.touches.length > 1) {
        armed = false
        return
      }
      const dx = event.touches[0].clientX - startX
      const dy = event.touches[0].clientY - startY
      if (
        Math.abs(dx) < SWIPE_DEADZONE_PX &&
        Math.abs(dy) < SWIPE_DEADZONE_PX
      ) {
        return
      }
      if (Math.abs(dy) > Math.abs(dx)) armed = false
    },
    { passive: true }
  )

  stage.addEventListener(
    "touchend",
    event => {
      if (!armed) return
      armed = false
      const touch = event.changedTouches[0]
      if (!touch) return

      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      if (Math.abs(dy) > Math.abs(dx)) return

      const travelled = Math.abs(dx) >= SWIPE_THRESHOLD_PX
      const flicked =
        Math.abs(dx) >= SWIPE_FLICK_PX &&
        Date.now() - startedAt <= SWIPE_FLICK_MS
      // Deciding here, on the up-event and only past a threshold, is what
      // satisfies 2.5.2 Pointer Cancellation: drag back before lifting and
      // nothing happens.
      if (!travelled && !flicked) return

      // Content follows the finger: dragging left brings the next image in.
      go(dx < 0 ? current + 1 : current - 1)
    },
    { passive: true }
  )

  stage.addEventListener(
    "touchcancel",
    () => {
      armed = false
    },
    { passive: true }
  )
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

  // Deliberately no srcset here, even though the thumbnail has one. Those
  // candidates carry Fastly width descriptors ("...&width=1280 1280w"), but
  // Fastly never upscales, so for the many OCW images narrower than 1280px the
  // descriptor overstates what comes back. The browser divides descriptor by
  // slot width to get a density, and lays the image out at naturalWidth/density
  // — on a 390px phone at DPR 3 that turned a 500px original into a 152px box,
  // smaller than the 171px thumbnail that opened it. The href is the
  // unoptimized original (the same URL the no-JS path navigates to), so its
  // intrinsic size is simply true.
  image.removeAttribute("srcset")
  image.removeAttribute("sizes")
  image.src = slide.href
  image.alt = slide.alt

  // Assigning src starts a *pending* request; per the spec the element keeps
  // presenting its current request until the new one is ready. That is what
  // stops an <img> going blank mid-swap, but here the dialog is a single
  // reused element, so on reopen the first painted frame was the bitmap left
  // over from the last slide viewed — under this slide's caption and counter,
  // which are plain synchronous writes and so were already correct.
  //
  // Hold the image back until what would be painted is this slide's own
  // bitmap. currentSrc is the URL actually being presented, so comparing it
  // with src is the direct question; complete/naturalWidth rule out the
  // pending and broken cases. Reopening the same slide passes all three and
  // never flickers.
  //
  // opacity, not visibility or display: those two drop the element from the
  // accessibility tree, which would take its alt text with them.
  const showingThisSlide =
    image.complete && image.naturalWidth > 0 && image.currentSrc === image.src
  image.classList.toggle(LOADING_CLASS, !showingThisSlide)

  // Rewriting the caption destroys whatever is inside it, and a credit link
  // is focusable — reachable by Tab, and left focused after a click. Losing
  // the focused element drops focus to <body>, which is outside the dialog,
  // and from there key events no longer bubble through the dialog's keydown
  // handler: the arrows went dead after exactly one press. Park focus on the
  // dialog first.
  //
  // The dialog rather than a button: Close would invite ending the session
  // with Enter, and Next/Previous would assert a direction that a Left press
  // or a swipe did not have.
  //
  // Only when focus is actually about to be destroyed. open() calls paint()
  // before showModal(), while the dialog is still display:none and focus is
  // on the trigger link, so this correctly does nothing there.
  if (caption.contains(document.activeElement)) {
    box.dialog.focus({ preventScroll: true })
  }
  caption.innerHTML = slide.captionHtml
  caption.hidden = !slide.captionHtml
  counter.textContent = `${current + 1} / ${slides.length}`

  // The dialog scrolls when a long caption and a usable image cannot share the
  // viewport (400% zoom). Start each slide at the top, so arrowing onward shows
  // the new image rather than leaving the reader parked on the old caption.
  box.dialog.scrollTop = 0

  // hidden, not disabled: a disabled button is still announced and still occupies
  // its target area, when for a single image the control does not exist at all.
  const single = slides.length < 2
  prev.hidden = single
  next.hidden = single

  return `Image ${current + 1} of ${slides.length}. ${slide.name}`
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
