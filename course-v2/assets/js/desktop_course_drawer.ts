// @ts-nocheck
import {
  getLocalStorageItem,
  setLocalStorageItem
} from "../../../base-theme/assets/js/utils"

// constants
const COURSE_DRAWER_LOCAL_STORAGE_KEY = "desktopCourseDrawerState"
const COURSE_DRAWER_OPENED = "open"
const COURSE_DRAWER_CLOSED = "closed"
// IDs of elements
const DESKTOP_COURSE_DRAWER_ID = "desktop-course-drawer"
const SHOW_COURSE_DRAWER_BTN_ID = "show-desktop-course-drawer"
const HIDE_COURSE_DRAWER_BTN_ID = "hide-desktop-course-drawer"
const MAIN_COURSE_SECTION_ID = "main-course-section"

export const initDesktopCourseDrawer = () => {
  showOrHideDesktopCourseDrawer()
  toggleDesktopCourseDrawer()
}

/*
 * This function either shows or hides the course drawer depending upon user's preference/selected option stored in localstorage.
 */
const showOrHideDesktopCourseDrawer = () => {
  const isCourseDrawerOpen = getLocalStorageItem(
    COURSE_DRAWER_LOCAL_STORAGE_KEY
  )
  //alert(isCourseDrawerOpen);

  if (isCourseDrawerOpen === null) {
    // No preference found so setting to "opened" as default
    setLocalStorageItem(COURSE_DRAWER_LOCAL_STORAGE_KEY, COURSE_DRAWER_OPENED)
  } else {
    if (isCourseDrawerOpen === COURSE_DRAWER_OPENED) {
      showDesktopCourseDrawer()
    } else {
      hideDesktopCourseDrawer()
    }
  }
}

/*
 * Adds and defines "click" event listeners for show-drawer and hide-drawer buttons, making this function act as a drawer toggler.
 */
const toggleDesktopCourseDrawer = () => {
  const showCourseDrawerBtn = document.getElementById(SHOW_COURSE_DRAWER_BTN_ID)
  const hideCourseDrawerBtn = document.getElementById(HIDE_COURSE_DRAWER_BTN_ID)
  showCourseDrawerBtn.addEventListener("click", () => {
    setLocalStorageItem(COURSE_DRAWER_LOCAL_STORAGE_KEY, COURSE_DRAWER_OPENED)
    showDesktopCourseDrawer()
  })
  hideCourseDrawerBtn.addEventListener("click", () => {
    setLocalStorageItem(COURSE_DRAWER_LOCAL_STORAGE_KEY, COURSE_DRAWER_CLOSED)
    hideDesktopCourseDrawer()
  })
}

const showDesktopCourseDrawer = () => {
  const desktopCourseDrawer = document.getElementById(DESKTOP_COURSE_DRAWER_ID)
  const showCourseDrawerBtn = document.getElementById(SHOW_COURSE_DRAWER_BTN_ID)
  const mainCourseSection = document.getElementById(MAIN_COURSE_SECTION_ID)
  desktopCourseDrawer.classList.remove("d-none")
  showCourseDrawerBtn.classList.add("d-none")
  mainCourseSection.classList.add("col-lg-9")
  mainCourseSection.classList.remove("col-md-12")
}

const hideDesktopCourseDrawer = () => {
  const desktopCourseDrawer = document.getElementById(DESKTOP_COURSE_DRAWER_ID)
  const showCourseDrawerBtn = document.getElementById(SHOW_COURSE_DRAWER_BTN_ID)
  const mainCourseSection = document.getElementById(MAIN_COURSE_SECTION_ID)
  desktopCourseDrawer.classList.add("d-none")
  showCourseDrawerBtn.classList.remove("d-none")
  mainCourseSection.classList.remove("col-lg-9")
  mainCourseSection.classList.add("col-md-12")
}
