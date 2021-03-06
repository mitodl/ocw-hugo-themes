// @ts-nocheck
export const initDesktopCourseInfoToggle = () => {
  const HIDE_COURSE_INFO_TEXT = "HIDE COURSE INFO"
  const SHOW_COURSE_INFO_TEXT = "SHOW COURSE INFO"
  const toggleElement = document.getElementById("desktop-course-info-toggle")
  if (toggleElement) {
    toggleElement.addEventListener("click", () => {
      const mainContent = document.getElementById("main-content")
      const desktopCourseInfo = document.getElementById("desktop-course-info")
      const desktopCourseInfoToggle = document.getElementById(
        "desktop-course-info-toggle"
      )
      desktopCourseInfo.classList.toggle("d-none")
      mainContent.classList.toggle("col-xl-8")
      mainContent.classList.toggle("col-lg-8")
      console.log(desktopCourseInfoToggle.innerText)
      if (desktopCourseInfoToggle.innerText === HIDE_COURSE_INFO_TEXT) {
        desktopCourseInfoToggle.firstChild.innerText = SHOW_COURSE_INFO_TEXT
      } else {
        desktopCourseInfoToggle.firstChild.innerText = HIDE_COURSE_INFO_TEXT
      }
    })
  }
}
