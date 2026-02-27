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

  it("does not close menu when clicking non-link content inside menu items", () => {
    document.body.innerHTML = `
      <div id="mobile-course-menu-v3">
        <button id="mobile-course-menu-toggle-v3" aria-expanded="true"></button>
        <div id="mobile-course-menu-items">
          <span class="some-text">Not a link</span>
          <a href="/pages/section-1">Section 1</a>
        </div>
      </div>
    `
    const toggleButton = document.getElementById("mobile-course-menu-toggle-v3")
    initMobileCourseMenuV3()

    toggleButton.click()
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true")

    const nonLink = document.querySelector(".some-text")
    nonLink.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true")
  })

  it("handles multiple rapid toggles correctly", () => {
    const toggleButton = document.getElementById("mobile-course-menu-toggle-v3")
    initMobileCourseMenuV3()

    // Rapid toggles
    toggleButton.click()
    toggleButton.click()
    toggleButton.click()

    // After 3 clicks from closed: open -> closed -> open
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true")
  })

  it("handles multiple pageshow events without error", () => {
    const toggleButton = document.getElementById("mobile-course-menu-toggle-v3")
    initMobileCourseMenuV3()

    toggleButton.click()
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true")

    window.dispatchEvent(new Event("pageshow"))
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false")

    toggleButton.click()
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true")

    window.dispatchEvent(new Event("pageshow"))
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false")
  })
})
