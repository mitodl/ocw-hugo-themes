// @ts-nocheck
import {
  getLocalStorageItem,
  setLocalStorageItem
} from "../../../base-theme/assets/js/utils"

// constants
const COURSE_DRAWER_LOCAL_STORAGE_KEY = "desktopCourseDrawerState"
const COURSE_DRAWER_OPENED = "opened"
const COURSE_DRAWER_CLOSED = "closed"
// IDs of elements
const DESKTOP_COURSE_DRAWER_ID = "desktop-course-drawer"
const SHOW_COURSE_DRAWER_BTN_ID = "show-desktop-course-drawer"
const HIDE_COURSE_DRAWER_BTN_ID = "hide-desktop-course-drawer"
const MAIN_COURSE_SECTION_ID = "main-course-section"

export const initDesktopCourseDrawer = () => {
  maintainDesktopCourseDrawerState()
  toggleDesktopCourseDrawer()
}

/*
 * Checks if user has already selected any option/state for drawer then it sets that else keep it open by default
 */
const maintainDesktopCourseDrawerState = () => {
  const isCourseDrawerOpen = getLocalStorageItem(
    COURSE_DRAWER_LOCAL_STORAGE_KEY
  )
  if (isCourseDrawerOpen === null) {
    // No preference found so setting to "opened" as default and opening the drawer
    setLocalStorageItem(COURSE_DRAWER_LOCAL_STORAGE_KEY, COURSE_DRAWER_OPENED)
    showOrHideDesktopCourseDrawer(COURSE_DRAWER_OPENED)
  } else {
    showOrHideDesktopCourseDrawer(isCourseDrawerOpen)
  }
}

const showOrHideDesktopCourseDrawer = state => {
  const desktopCourseDrawer = document.getElementById(DESKTOP_COURSE_DRAWER_ID)
  const showCourseDrawerBtn = document.getElementById(SHOW_COURSE_DRAWER_BTN_ID)
  const mainCourseSection = document.getElementById(MAIN_COURSE_SECTION_ID)
  if (state === COURSE_DRAWER_OPENED) {
    desktopCourseDrawer.classList.remove("d-none")
    showCourseDrawerBtn.classList.add("d-none")
    mainCourseSection.classList.add("col-lg-9")
    mainCourseSection.classList.remove("col-md-12")
  } else {
    desktopCourseDrawer.classList.add("d-none")
    showCourseDrawerBtn.classList.remove("d-none")
    mainCourseSection.classList.remove("col-lg-9")
    mainCourseSection.classList.add("col-md-12")
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
    showOrHideDesktopCourseDrawer(COURSE_DRAWER_OPENED)
  })
  hideCourseDrawerBtn.addEventListener("click", () => {
    setLocalStorageItem(COURSE_DRAWER_LOCAL_STORAGE_KEY, COURSE_DRAWER_CLOSED)
    showOrHideDesktopCourseDrawer(COURSE_DRAWER_CLOSED)
  })
}
