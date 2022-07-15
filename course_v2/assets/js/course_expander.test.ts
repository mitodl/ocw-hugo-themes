// @ts-nocheck
import { JSDOM } from "jsdom"

import { initCourseInfoExpander } from "./course_expander"

describe("initCourseInfoExpander", () => {
  let html

  beforeEach(() => {
    html = `<body>
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
    </body>`
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

  const toggleButton = (button, isMouseClick, window) => {
    if (isMouseClick) {
      button.click()
    } else {
      const event = new window.KeyboardEvent("keypress", {
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
        const { window } = new JSDOM(html)
        const document = window.document
        initCourseInfoExpander(document)
        const buttonSelectors = [".read-more", ".course-info-link"]
        const selector = isReadMore ? ".read-more" : ".course-info-link"
        const button = document.querySelector(selector)
        const otherButton = document.querySelector(
          buttonSelectors.find(_selector => _selector !== selector)
        )
        assertExpanded(button, false)
        assertExpanded(otherButton, false)
        toggleButton(button, isMouseClick, window)
        assertExpanded(button, true)
        assertExpanded(otherButton, false)
        toggleButton(button, isMouseClick, window)
        assertExpanded(button, false)
        assertExpanded(otherButton, false)
      })
    })
  })
})
