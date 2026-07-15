// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const toggleExpand = (button, container) => {
  const expanded = button.classList.contains("expanded")
  const readmoreText = button.querySelector(".read-more-text")
  const arrow = button.querySelector(".expander-arrow")
  if (expanded) {
    button.classList.remove("expanded")
    button.setAttribute("aria-expanded", "false")
    container.classList.add("collapsed")
    if (arrow) {
      arrow.textContent = "keyboard_arrow_right"
    }
  } else {
    button.classList.add("expanded")
    button.setAttribute("aria-expanded", "true")
    container.classList.remove("collapsed")
    if (arrow) {
      arrow.textContent = "keyboard_arrow_down"
    }
  }

  if (readmoreText) {
    readmoreText.textContent = expanded ? "Read More" : "Show Less"
  }
}

const initCourseInfoExpander = document => {
  for (const expanderButton of document.querySelectorAll(".expand-link")) {
    const container = expanderButton.closest(".expand-container")
    expanderButton.addEventListener("click", event => {
      event.preventDefault()
      toggleExpand(expanderButton, container)
    })
    expanderButton.addEventListener("keypress", event => {
      if (event.key === "Enter") {
        event.preventDefault()
        toggleExpand(expanderButton, container)
      }
    })
  }
}

const COLLAPSED_CLASS = "description-collapsed"

// Absorbs sub-pixel rounding: scrollHeight and clientHeight are rounded to
// integers independently, so at fractional zoom levels they can disagree by
// a pixel with nothing actually clipped. Genuine clamp overflow is at least
// one line box (~22px), far above this tolerance.
const OVERFLOW_TOLERANCE_PX = 2

const initCourseDescriptionExpander = document => {
  const description = document.getElementById("course-description-text")
  const toggleButton = document.getElementById("toggle-description")
  if (!description || !toggleButton) {
    return
  }

  const updateToggleVisibility = () => {
    // Only auto-hide while collapsed; when expanded the button must
    // stay visible so the user can collapse again.
    if (description.classList.contains(COLLAPSED_CLASS)) {
      const isOverflowing =
        description.scrollHeight - description.clientHeight >
        OVERFLOW_TOLERANCE_PX
      // d-flex must be swapped together with d-none: both are !important
      // display utilities and .d-flex overrides .d-none in Bootstrap 4's
      // source order, so an element with both classes stays visible.
      toggleButton.classList.toggle("d-none", !isOverflowing)
      toggleButton.classList.toggle("d-flex", isOverflowing)
    }
  }

  toggleButton.addEventListener("click", () => {
    const collapsed = description.classList.toggle(COLLAPSED_CLASS)
    toggleButton.textContent = collapsed ? "Show more" : "Show less"
    toggleButton.setAttribute("aria-expanded", String(!collapsed))
    updateToggleVisibility()
  })

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(updateToggleVisibility).observe(description)
  } else {
    description.ownerDocument.defaultView.addEventListener(
      "resize",
      updateToggleVisibility
    )
  }
  // A webfont swap can change the wrapped line count without changing the
  // clamped element's height (e.g. six fallback-font lines becoming exactly
  // five), which the ResizeObserver cannot see — re-check once fonts land.
  // `ready` alone is not enough: the Typekit stylesheet is fetched and
  // injected by script (extrahead.html), so its faces can start loading
  // after `ready` has already resolved. `loadingdone` fires for every
  // completed batch of font loads, whenever it happens.
  // document.fonts is absent in jsdom, hence the guard.
  if (document.fonts) {
    document.fonts.ready.then(updateToggleVisibility)
    document.fonts.addEventListener("loadingdone", updateToggleVisibility)
  }
  updateToggleVisibility()
}

export { initCourseInfoExpander, initCourseDescriptionExpander }
