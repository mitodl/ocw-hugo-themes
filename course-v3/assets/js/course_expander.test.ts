// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  initCourseInfoExpander,
  initCourseDescriptionExpander
} from "./course_expander"

describe("initCourseInfoExpander", () => {
  beforeEach(() => {
    // Clear and set up the DOM for each test
    document.body.innerHTML = `
    <div class="course-description expand-container collapsed">
      <div class="course-info expand-container collapsed">
        <a class="expand-link course-info-link" aria-expanded="false">
          <h4>Course Info</h4>
          <span class="expander-arrow material-icons">keyboard_arrow_right</span>
        </a>
      </div>
      <button class="expand-link read-more" aria-expanded="false">
        <span class="read-more-text">Read More</span>
      </button>
    </div>
    `
  })

  const assertExpanded = (button, expanded) => {
    const container = button.closest(".expand-container")
    expect(button.getAttribute("aria-expanded")).toBe(String(expanded))
    expect(button.classList.contains("expanded")).toBe(expanded)
    expect(container.classList.contains("collapsed")).toBe(!expanded)
    const readmore = button.querySelector(".read-more-text")
    if (readmore) {
      expect(readmore.textContent).toBe(expanded ? "Show Less" : "Read More")
    }
    const arrow = button.querySelector(".expander-arrow")
    if (arrow) {
      expect(arrow.textContent).toBe(
        expanded ? "keyboard_arrow_down" : "keyboard_arrow_right"
      )
    }
  }

  const toggleButton = (button, isMouseClick) => {
    if (isMouseClick) {
      button.click()
    } else {
      const event = new KeyboardEvent("keypress", {
        key:     "Enter",
        bubbles: true
      })
      button.dispatchEvent(event)
    }
  }

  //
  ;[true, false].forEach(isReadMore => {
    [true, false].forEach(isMouseClick => {
      it(`toggles the ${isReadMore ? "read more" : "course info"} link by ${
        isMouseClick ? "click" : "enter"
      }`, () => {
        initCourseInfoExpander(document)
        const buttonSelectors = [".read-more", ".course-info-link"]
        const selector = isReadMore ? ".read-more" : ".course-info-link"
        const button = document.querySelector(selector)
        const otherButton = document.querySelector(
          buttonSelectors.find(_selector => _selector !== selector)
        )
        assertExpanded(button, false)
        assertExpanded(otherButton, false)
        toggleButton(button, isMouseClick)
        assertExpanded(button, true)
        assertExpanded(otherButton, false)
        toggleButton(button, isMouseClick)
        assertExpanded(button, false)
        assertExpanded(otherButton, false)
      })
    })
  })
})

describe("initCourseDescriptionExpander", () => {
  beforeEach(() => {
    document.body.innerHTML = `
    <div id="course-description">
      <div id="course-description-text" class="description description-collapsed">
        <p>A long course description.</p>
      </div>
      <button id="toggle-description" class="d-none align-items-center" aria-expanded="false">Show more</button>
    </div>
    `
  })

  const assertToggleVisible = (toggle, visible) => {
    expect(toggle.classList.contains("d-none")).toBe(!visible)
    expect(toggle.classList.contains("d-flex")).toBe(visible)
  }

  const setHeights = (element, { scrollHeight, clientHeight }) => {
    Object.defineProperty(element, "scrollHeight", {
      configurable: true,
      value:        scrollHeight
    })
    Object.defineProperty(element, "clientHeight", {
      configurable: true,
      value:        clientHeight
    })
  }

  it("shows the toggle button and expands/collapses when the text overflows", () => {
    const description = document.getElementById("course-description-text")
    const toggle = document.getElementById("toggle-description")
    setHeights(description, { scrollHeight: 200, clientHeight: 110 })

    initCourseDescriptionExpander(document)
    assertToggleVisible(toggle, true)

    toggle.click()
    expect(description.classList.contains("description-collapsed")).toBe(false)
    expect(toggle.textContent).toBe("Show less")
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    assertToggleVisible(toggle, true)

    toggle.click()
    expect(description.classList.contains("description-collapsed")).toBe(true)
    expect(toggle.textContent).toBe("Show more")
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    assertToggleVisible(toggle, true)
  })

  it("keeps the toggle button hidden when the text fits", () => {
    const description = document.getElementById("course-description-text")
    const toggle = document.getElementById("toggle-description")
    setHeights(description, { scrollHeight: 80, clientHeight: 80 })

    initCourseDescriptionExpander(document)
    assertToggleVisible(toggle, false)
  })

  it("treats sub-pixel rounding overflow as fitting", () => {
    const description = document.getElementById("course-description-text")
    const toggle = document.getElementById("toggle-description")
    setHeights(description, { scrollHeight: 82, clientHeight: 80 })

    initCourseDescriptionExpander(document)
    assertToggleVisible(toggle, false)
  })

  it("re-checks overflow once webfonts are ready", async () => {
    const description = document.getElementById("course-description-text")
    const toggle = document.getElementById("toggle-description")
    setHeights(description, { scrollHeight: 80, clientHeight: 80 })
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value:        { ready: Promise.resolve(), addEventListener: jest.fn() }
    })

    initCourseDescriptionExpander(document)
    assertToggleVisible(toggle, false)

    // Simulate the font swap reflowing the text into overflow without a
    // height change (the case the ResizeObserver cannot detect)
    setHeights(description, { scrollHeight: 200, clientHeight: 110 })
    await document.fonts.ready
    assertToggleVisible(toggle, true)

    delete document.fonts
  })

  it("re-checks overflow when fonts load after fonts.ready has resolved", () => {
    const description = document.getElementById("course-description-text")
    const toggle = document.getElementById("toggle-description")
    setHeights(description, { scrollHeight: 80, clientHeight: 80 })
    const fontListeners = {}
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value:        {
        ready:            Promise.resolve(),
        addEventListener: (type, listener) => {
          fontListeners[type] = listener
        }
      }
    })

    initCourseDescriptionExpander(document)
    assertToggleVisible(toggle, false)

    // A stylesheet injected after init (the Typekit fetch in extrahead.html)
    // starts new font loads, so loadingdone can fire long after the ready
    // promise grabbed at init has resolved
    setHeights(description, { scrollHeight: 200, clientHeight: 110 })
    fontListeners.loadingdone()
    assertToggleVisible(toggle, true)

    delete document.fonts
  })

  it("does nothing when the description elements are missing", () => {
    document.body.innerHTML = ""
    expect(() => initCourseDescriptionExpander(document)).not.toThrow()
  })
})
