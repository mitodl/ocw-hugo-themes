export const MOBILE_COURSE_NAV_DRAWER_ID = "mobile-course-nav"
export const MOBILE_COURSE_INFO_DRAWER_ID = "course-info-drawer"

enum SwipeDirection {
  Left = "L",
  Right = "R"
}

export const initCourseDrawersClosingViaSwiping = () => {
  enableSwiping(
    MOBILE_COURSE_NAV_DRAWER_ID,
    "mobile-course-nav-toggle",
    "close-mobile-course-menu-button",
    SwipeDirection.Left
  )
  enableSwiping(
    MOBILE_COURSE_INFO_DRAWER_ID,
    "mobile-course-info-toggle",
    "close-mobile-course-info-button",
    SwipeDirection.Right
  )
}

/**
 * It adds touch event listener to the element and clicks the button when swiped in the mentioned direction.
 *
 * @param {string} elementId element on which touch eventlistenter is added.
 * @param {string} buttonId This button will be clicked on swiping
 * @param {string} closeButtonId This button will be clicked to close the drawer
 * @param {string} swipeDirection L= Swipe left, R= Swipe Right
 */
const enableSwiping = (
  elementId: string,
  buttonId: string,
  closeButtonId: string,
  swipeDirection: SwipeDirection
) => {
  const element = document.getElementById(elementId)
  const button = document.getElementById(buttonId)
  const closeButton = document.getElementById(closeButtonId)

  if (!element) throw Error(`Element having ID: ${elementId} does not exist`)

  let touchstartX = 0
  let touchendX = 0

  element.addEventListener("touchstart", e => {
    touchstartX = e.changedTouches[0].screenX
  })

  element.addEventListener("touchend", e => {
    touchendX = e.changedTouches[0].screenX
    if (
      (swipeDirection === SwipeDirection.Right && touchendX > touchstartX) ||
      (swipeDirection === SwipeDirection.Left && touchendX < touchstartX)
    ) {
      const buttonElement = document.getElementById(buttonId)
      if (!buttonElement) {
        throw Error(`Button element having ID: ${buttonId} does not exist`)
      }

      buttonElement.click()
    }
  })

  button?.addEventListener("click", () => {
    closeButton?.focus()
  })

  closeButton?.addEventListener("click", () => {
    button?.focus()
  })
}
