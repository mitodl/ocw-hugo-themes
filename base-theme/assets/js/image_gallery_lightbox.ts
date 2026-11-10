import { fastlyOptimizedUrl } from "./utils"

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
 * course-v3/layouts/shortcodes/image-gallery-item.html, so this file builds no
 * URLs of its own: it loads the anchor's href, adding only Fastly's format and
 * quality parameters (see paint()).
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
/** How long after showModal() the opening slide is announced (see open()). */
const ANNOUNCE_DELAY_MS = 100

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
  captionHtml: string
}

interface Lightbox {
  dialog: HTMLDialogElement
  image: HTMLImageElement
  caption: HTMLElement
  /** The compact "2 / 8", for eyes only — see paint() for why it is split. */
  counterGlyph: HTMLElement
  /**
   * The same position spelled out, for screen readers. The counter is the
   * dialog's live region, so writing this is what announces a slide.
   */
  counterLabel: HTMLElement
  prev: HTMLButtonElement
  next: HTMLButtonElement
}

let lightbox: Lightbox | null = null
let slides: Slide[] = []
let current = 0
let listening = false
/** The opening slide's announcement, until it is made (see open()). */
let announceTimer = 0

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
  // When the resource has no image-alt the shortcode leaves alt empty and
  // labels the anchor instead, from data-ngdesc / the caption / the resource
  // title. That label is not copied onto the image: as alt it would assert it
  // describes what the image *shows*. An empty alt is the honest encoding for
  // "no description available", and faking one also hides the gap from anyone
  // fixing the content later.
  return {
    href:        link.getAttribute("href") || "",
    alt:         img?.getAttribute("alt") || "",
    captionHtml: caption?.innerHTML.trim() || ""
  }
}

function build(): Lightbox {
  const dialog = document.createElement("dialog")
  dialog.className = DIALOG_CLASS
  // Without a name the dialog announces only as "dialog". The name leaves the
  // position out: VoiceOver reads a dialog's name again whenever it changes,
  // so a name that followed the slide had Next say "Image viewer Image 3 of
  // 14" and then, from the counter, "Image 3 of 14".
  dialog.setAttribute("aria-label", "Image viewer")
  // Focusable only programmatically, as somewhere for focus to land when the
  // element holding it is about to be replaced — see paint().
  dialog.setAttribute("tabindex", "-1")
  // A screen reader reads the dialog in DOM order, and this is the order an
  // accessibility review asked for: position and Close, the caption and the
  // image, then Previous and Next (1.3.2). The arrows used to come straight
  // after Close, ahead of the content they act on, so a reader who had
  // finished the caption had to go back up to reach Next. Close stays first,
  // and focus starts there: the tab cycle is Close, any link in the caption,
  // Previous, Next, so every focusable in the dialog is reached before focus
  // leaves it (2.4.3).
  //
  // The order here moves nothing on screen. image-gallery.scss puts the
  // caption bar back under the image and places the controls itself: they are
  // position: fixed, except in a short window, where they share the image
  // area's grid cell.
  //
  // The counter is also the live region, so changing slide says the new
  // position. It used to be a separate, visually hidden paragraph after Next,
  // which said the description too; the review asked for it to go, since it
  // stayed in the reading order and a reader going through the dialog met both
  // a second time.
  dialog.innerHTML = `
    <p class="image-gallery-lightbox__counter" role="status" aria-live="polite"><span class="image-gallery-lightbox__counter-glyph" aria-hidden="true"></span><span class="image-gallery-lightbox__counter-label sr-only"></span></p>
    <button class="image-gallery-lightbox__button image-gallery-lightbox__close" type="button" aria-label="Close image viewer" autofocus>
      <span class="material-icons" aria-hidden="true">close</span>
    </button>
    <div class="image-gallery-lightbox__bar">
      <p class="image-gallery-lightbox__caption"></p>
    </div>
    <div class="image-gallery-lightbox__stage">
      <img class="image-gallery-lightbox__image" alt="" />
    </div>
    <button class="image-gallery-lightbox__button image-gallery-lightbox__prev" type="button" aria-label="Previous image">
      <span class="material-icons" aria-hidden="true">chevron_left</span>
    </button>
    <button class="image-gallery-lightbox__button image-gallery-lightbox__next" type="button" aria-label="Next image">
      <span class="material-icons" aria-hidden="true">chevron_right</span>
    </button>`
  document.body.appendChild(dialog)

  const box: Lightbox = {
    dialog,
    image:        dialog.querySelector(".image-gallery-lightbox__image")!,
    caption:      dialog.querySelector(".image-gallery-lightbox__caption")!,
    counterGlyph: dialog.querySelector(
      ".image-gallery-lightbox__counter-glyph"
    )!,
    counterLabel: dialog.querySelector(
      ".image-gallery-lightbox__counter-label"
    )!,
    prev: dialog.querySelector(".image-gallery-lightbox__prev")!,
    next: dialog.querySelector(".image-gallery-lightbox__next")!
  }

  // Reveal as soon as this slide's own bitmap is what would be painted. On
  // error too, so a broken image falls back to showing its alt text rather
  // than staying invisible forever. Paging fast can leave the previous slide's
  // load still queued; it dispatches while the element is presenting that
  // slide's bitmap, so check currentSrc before trusting it.
  const reveal = () => {
    if (box.image.currentSrc !== box.image.src) return
    box.image.classList.remove(LOADING_CLASS)
  }
  box.image.addEventListener("load", reveal)
  box.image.addEventListener("error", reveal)

  box.prev.addEventListener("click", () => go(current - 1))
  box.next.addEventListener("click", () => go(current + 1))
  dialog
    .querySelector(".image-gallery-lightbox__close")!
    .addEventListener("click", () => dialog.close())

  dialog.addEventListener("keydown", event => {
    // Modified arrows belong to the browser: Alt+Left/Right is Back/Forward on
    // Windows and Linux, Cmd+Left/Right on macOS.
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
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
  // stage, caption bar and the controls — so a click never targets the
  // dialog element itself. Escape and the close button are the ways out.

  // The dialog is reused, so on a reopen at the same slide the position would
  // still be there, and an identical value is not a mutation — meaning no
  // announcement. Clear it, and cancel an opening announcement still to come,
  // which would write it back.
  dialog.addEventListener("close", () => {
    window.clearTimeout(announceTimer)
    box.counterLabel.textContent = ""
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
      // A second finger means pinch-zoom. Never a slide change. Nor is a drag
      // once the page is zoomed in: the stage allows pinch-zoom, and a reader
      // zoomed into the image drags to pan across it.
      const zoomed = (window.visualViewport?.scale ?? 1) > 1
      armed = event.touches.length === 1 && slides.length > 1 && !zoomed
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
 * Paint slide `index` (wrapping at both ends), leaving the live region to
 * announcePosition().
 */
function paint(index: number): void {
  const box = lightbox!
  current = (index + slides.length) % slides.length
  const slide = slides[current]
  const { image, caption, counterGlyph, prev, next } = box

  // Deliberately no srcset here, even though the thumbnail has one. Those
  // candidates carry Fastly width descriptors ("...&width=1280 1280w"), but
  // Fastly never upscales, so for the many OCW images narrower than 1280px the
  // descriptor overstates what comes back. The browser divides descriptor by
  // slot width to get a density, and lays the image out at naturalWidth/density
  // — on a 390px phone at DPR 3 that turned a 500px original into a 152px box,
  // smaller than the 171px thumbnail that opened it.
  //
  // Fastly's format and quality conversion is kept, though, as nanogallery2
  // had it: with no width parameter Fastly returns the original dimensions, so
  // the intrinsic size stays true while the browser still gets WebP or AVIF.
  // fastlyOptimizedUrl leaves offline packages' relative paths untouched.
  image.removeAttribute("srcset")
  image.removeAttribute("sizes")
  image.src = fastlyOptimizedUrl(slide.href, { format: "auto", quality: "75" })
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
  // Two copies of the position on purpose, not a duplicate. Only this compact
  // glyph is hidden from screen readers: "2 / 8" is fine to see and poor to
  // hear, since the slash is read out or dropped depending on the screen
  // reader's symbol level. The spelled-out copy, written by announcePosition(),
  // is what announces each slide and what answers "which one am I on?" after
  // that, which is why the counter must not be aria-hidden wholesale.
  counterGlyph.textContent = `${current + 1} / ${slides.length}`

  // The dialog scrolls when a long caption and a usable image cannot share the
  // viewport (400% zoom). Start each slide at the top, so arrowing onward shows
  // the new image rather than leaving the reader parked on the old caption.
  box.dialog.scrollTop = 0

  // hidden, not disabled: a disabled button is still announced and still occupies
  // its target area, when for a single image the control does not exist at all.
  const single = slides.length < 2
  prev.hidden = single
  next.hidden = single
}

/**
 * Spell the current position out in the counter, the dialog's live region,
 * which is what has a screen reader say "Image 2 of 8".
 *
 * Kept out of paint() for open()'s sake: it paints while the dialog is still
 * closed, and a closed <dialog> is display:none. A live region written in an
 * unrendered subtree is never announced, and showing it afterwards is not a
 * mutation, so the opening slide would never be announced at all.
 */
function announcePosition(): void {
  // A change of slide before the opening announcement takes its place. Made
  // late, the opening one would repeat the new position.
  window.clearTimeout(announceTimer)
  const { counterLabel } = lightbox!
  counterLabel.textContent = `Image ${current + 1} of ${slides.length}`
}

/** Move to slide `index` while the dialog is already open. */
function go(index: number): void {
  if (!lightbox || slides.length === 0) return
  paint(index)
  announcePosition()
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

  paint(Math.max(0, links.indexOf(link)))
  lightbox.dialog.showModal()
  // Only once the dialog is open — see announcePosition() — and in a later
  // task. Written in this one, the position is already in the live region when
  // the accessibility tree first sees it, so there is no change to announce:
  // VoiceOver in Chrome said only "Image viewer, dialog". In Chrome any later
  // task will do, even with a 0ms timer; the 100ms is headroom for the other
  // browsers, which have not been checked.
  announceTimer = window.setTimeout(announcePosition, ANNOUNCE_DELAY_MS)
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
