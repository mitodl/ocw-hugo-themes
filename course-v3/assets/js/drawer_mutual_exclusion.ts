/**
 * Drawer Mutual Exclusion
 *
 * The "Explore MIT" nav drawer (#mit-learn-nav-drawer, driven by
 * mit_learn_header.ts's own custom open/close logic) and the "Course Info"
 * drawer (#course-info-drawer, driven by the vendored offcanvas-bootstrap
 * library) are two completely independent systems with zero awareness of
 * each other. This module makes opening either one close the other, so only
 * one of the two is ever open at a time - matching the single-drawer
 * behavior every other part of the site already has.
 */

export function initDrawerMutualExclusion(): void {
  const exploreDesktopButton = document.getElementById(
    "mit-learn-menu-button-desktop"
  )
  const exploreMobileButton = document.getElementById(
    "mit-learn-menu-button-mobile"
  )
  const exploreDrawer = document.getElementById("mit-learn-nav-drawer")
  const exploreBackdrop = document.getElementById("mit-learn-nav-backdrop")
  const infoDrawer = document.getElementById("course-info-drawer")
  const infoToggle = document.getElementById("mobile-course-info-toggle")

  if (!infoDrawer || !exploreDrawer) {
    return
  }

  // Explore's backdrop covers the entire viewport while open (it isn't
  // scoped to just the drawer's own width), including page controls
  // underneath it like the Course Info toggle - a real click there hits the
  // backdrop, not the toggle underneath, so it only closes Explore and
  // never reaches Info's own click handler at all. mit_learn_header.ts's
  // own backdrop listener (registered first, at initMITLearnHeader() time)
  // already closes Explore unconditionally for any backdrop click, since
  // listeners on the same element/event fire in registration order. If the
  // click landed within the Info toggle's own screen position, forward it
  // there too, so one click both closes Explore and opens Info, matching
  // what the user was actually trying to do.
  exploreBackdrop?.addEventListener("click", (e: MouseEvent) => {
    if (!infoToggle) {
      return
    }
    const rect = infoToggle.getBoundingClientRect()
    const withinToggle =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    if (withinToggle) {
      infoToggle.click()
      // The original backdrop click keeps bubbling after this handler
      // returns (nothing else here calls stopPropagation on it), and
      // offcanvas-bootstrap's own document-level "click outside closes the
      // drawer" listener (bound once, globally, at library-load time) would
      // otherwise see it land back at document with a target outside
      // `.navbar-offcanvas`/`.offcanvas-toggle` - i.e. exactly the "click
      // outside" case it exists to handle - and immediately close the Info
      // drawer we just opened via the synchronous infoToggle.click() above.
      // Stop it here so the forwarded open sticks.
      e.stopPropagation()
    }
  })

  // Explore's trigger buttons -> close Info if it's open.
  //
  // Attached directly on the button elements themselves, NOT delegated via
  // `document`. mit_learn_header.ts's own click handlers on these same
  // buttons call e.stopPropagation(), which is exactly why a document-level
  // listener never sees this click today. stopPropagation only blocks
  // bubbling to ancestors - it does not stop other listeners bound to the
  // SAME element from firing - so listening directly on the button
  // sidesteps the problem entirely.
  const closeInfoIfOpen = (): void => {
    // offcanvas-bootstrap's own safe close path (bootstrap.offcanvas.js
    // `_close`, wired to the `offcanvas.close` custom event at
    // construction). Self-guarded: `_close` returns immediately if the
    // target doesn't have `.in`, so calling this when Info is already
    // closed is a correct, side-effect-free no-op. Never hand-roll the
    // class removal here - `_close` also resets the toggle button's
    // `is-open` class and the body scroll-lock class, which a raw
    // classList.remove would skip.
    $(infoDrawer).trigger("offcanvas.close")
  }
  exploreDesktopButton?.addEventListener("click", closeInfoIfOpen)
  exploreMobileButton?.addEventListener("click", closeInfoIfOpen)

  // Info opening -> close Explore if it's open.
  //
  // Listens for offcanvas-bootstrap's own `show.bs.offcanvas`, fired on
  // #course-info-drawer immediately before it gains `.in` (i.e. only on a
  // real "opening" transition - `_sendEventsBefore` fires `hide.bs.offcanvas`
  // instead when the drawer already has `.in`, i.e. is closing). Preferred
  // over a raw click listener on #mobile-course-info-toggle because:
  //   (a) it fires from every internal path that can open Info (a direct
  //       click via _clicked, or any future `offcanvas.open` trigger via
  //       _open), not just today's one toggle button;
  //   (b) "open" vs "close" is already distinguished for us, so clicking
  //       Info's own toggle to CLOSE it never fires this handler at all -
  //       no extra guard needed on our side for that case.
  $(infoDrawer).on("show.bs.offcanvas", () => {
    // Guard required here (asymmetric with the Explore->Info direction
    // above): mit_learn_header.ts's closeDrawer() unconditionally refocuses
    // its trigger button as its last step, with no isOpen check of its own.
    // Blindly closing Explore every time Info opens would spuriously steal
    // focus onto Explore's button even when Explore was never open. Check
    // first.
    if (exploreDrawer.classList.contains("open")) {
      // mit_learn_header.ts exports no close function and fires no custom
      // event (openDrawer/closeDrawer/isOpen are closure-private). The only
      // real, fully-correct existing path to its closeDrawer() from outside
      // is to trigger one of its own wired DOM listeners. The backdrop is
      // the right one to use: it's a single element regardless of viewport
      // (unlike the two menu buttons, so we don't have to guess desktop vs.
      // mobile), and its click handler is unconditional
      // (`backdrop?.addEventListener("click", () => closeDrawer())`, no
      // guard). A plain .click() fires it even though the backdrop is
      // `display: none` / `pointer-events: none` while hidden - those are
      // hit-testing/paint properties for real pointer input, not a
      // restriction on programmatic dispatch.
      exploreBackdrop?.click()
    }
  })
}

export default initDrawerMutualExclusion
