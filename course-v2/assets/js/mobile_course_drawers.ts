export const initCourseDrawersClosingViaSwiping = () => {
  elementSwiping("mobile-course-nav", "mobile-course-nav-toggle", "L")
  elementSwiping("course-info-drawer", "mobile-course-info-toggle", "R")
}

/**
 * It adds touch event listener to the element and clicks the button when swiped in the mentioned direction.
 *
 * @param {string} elementId element on which touch eventlistenter is added.
 * @param {string} buttonId This button will be clicked on swiping
 * @param {string} swipeDirection L= Swipe left, R= Swipe Right
 * @return {any} data fetched from localstorage
 */
const elementSwiping = (
  elementId: string,
  buttonId: string,
  swipeDirection: string
) => {
  const element = document.getElementById(elementId)
  let touchstartX = 0
  let touchendX = 0

  element?.addEventListener("touchstart", e => {
    touchstartX = e.changedTouches[0].screenX
  })

  element?.addEventListener("touchend", e => {
    touchendX = e.changedTouches[0].screenX
    if (swipeDirection === "R") {
      // checking if its a right swipe
      if (touchendX > touchstartX) document.getElementById(buttonId)?.click()
    } else {
      if (touchendX < touchstartX) document.getElementById(buttonId)?.click()
    }
  })
}
