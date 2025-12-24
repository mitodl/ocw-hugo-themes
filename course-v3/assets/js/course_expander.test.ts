// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { initCourseInfoExpander } from "./course_expander"

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
