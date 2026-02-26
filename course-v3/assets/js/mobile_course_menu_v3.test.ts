// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { initMobileCourseMenuV3 } from "./mobile_course_menu_v3"

describe("initMobileCourseMenuV3", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="mobile-course-menu-v3">
        <button id="mobile-course-menu-toggle-v3" aria-expanded="true"></button>
        <div id="mobile-course-menu-items">
          <a href="/pages/section-1">Section 1</a>
        </div>
      </div>
    `
  })

  it("collapses the menu immediately on initialization", () => {
    const toggleButton = document.getElementById("mobile-course-menu-toggle-v3")
    initMobileCourseMenuV3()

    expect(toggleButton.getAttribute("aria-expanded")).toBe("false")
  })

  it("toggles menu state when clicking the toggle button", () => {
    const toggleButton = document.getElementById("mobile-course-menu-toggle-v3")
    initMobileCourseMenuV3()

    toggleButton.click()
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true")

    toggleButton.click()
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false")
  })

  it("collapses the menu when clicking outside", () => {
    const toggleButton = document.getElementById("mobile-course-menu-toggle-v3")
    initMobileCourseMenuV3()

    toggleButton.click()
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true")

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false")
  })

  it("collapses the menu when clicking a link inside the menu", () => {
    const toggleButton = document.getElementById("mobile-course-menu-toggle-v3")
    const menuLink = document.querySelector("#mobile-course-menu-items a")
    initMobileCourseMenuV3()

    toggleButton.click()
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true")

    menuLink.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false")
  })

  it("collapses the menu on pageshow", () => {
    const toggleButton = document.getElementById("mobile-course-menu-toggle-v3")
    initMobileCourseMenuV3()

    toggleButton.click()
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true")

    window.dispatchEvent(new Event("pageshow"))
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false")
  })

  it("returns early when required elements are not present", () => {
    document.body.innerHTML = `<div id="other-node"></div>`
    expect(() => initMobileCourseMenuV3()).not.toThrow()
  })
})
