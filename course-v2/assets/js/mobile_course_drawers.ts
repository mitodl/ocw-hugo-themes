enum SWIPE_DIRECTION {
  Left = "L",
  Right = "R"
}

export const initCourseDrawersClosingViaSwiping = () => {
  elementSwiping(
    "mobile-course-nav",
    "mobile-course-nav-toggle",
    SWIPE_DIRECTION.Left
  )
  elementSwiping(
    "course-info-drawer",
    "mobile-course-info-toggle",
    SWIPE_DIRECTION.Right
  )
}

/**
 * It adds touch event listener to the element and clicks the button when swiped in the mentioned direction.
 *
 * @param {string} elementId element on which touch eventlistenter is added.
 * @param {string} buttonId This button will be clicked on swiping
 * @param {string} swipeDirection L= Swipe left, R= Swipe Right
 */
const elementSwiping = (
  elementId: string,
  buttonId: string,
  swipeDirection: SWIPE_DIRECTION
) => {
  const element = document.getElementById(elementId)
  let touchstartX = 0
  let touchendX = 0

  element?.addEventListener("touchstart", e => {
    touchstartX = e.changedTouches[0].screenX
  })

  element?.addEventListener("touchend", e => {
    touchendX = e.changedTouches[0].screenX
    if (
      (swipeDirection === SWIPE_DIRECTION.Right && touchendX > touchstartX) ||
      (swipeDirection === SWIPE_DIRECTION.Left && touchendX < touchstartX)
    ) {
      document.getElementById(buttonId)?.click()
    }
  })
}
