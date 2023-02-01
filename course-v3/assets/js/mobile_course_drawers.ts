enum SwipeDirection {
  Left = "L",
  Right = "R"
}

export const initCourseDrawersClosingViaSwiping = () => {
  enableSwiping(
    "mobile-course-nav",
    "mobile-course-nav-toggle",
    SwipeDirection.Left
  )
  enableSwiping(
    "course-info-drawer",
    "mobile-course-info-toggle",
    SwipeDirection.Right
  )
}

/**
 * It adds touch event listener to the element and clicks the button when swiped in the mentioned direction.
 *
 * @param {string} elementId element on which touch eventlistenter is added.
 * @param {string} buttonId This button will be clicked on swiping
 * @param {string} swipeDirection L= Swipe left, R= Swipe Right
 */
const enableSwiping = (
  elementId: string,
  buttonId: string,
  swipeDirection: SwipeDirection
) => {
  const element = document.getElementById(elementId)
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
}
