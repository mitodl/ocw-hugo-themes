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
      if (!(desktopCourseInfoToggle && desktopCourseInfo && mainContent)) {
        throw new Error("Expected elemented to exist")
      }
      desktopCourseInfo.classList.toggle("d-none")
      mainContent.classList.toggle("col-xl-8")
      mainContent.classList.toggle("col-lg-8")
      if (desktopCourseInfoToggle.innerText === HIDE_COURSE_INFO_TEXT) {
        desktopCourseInfoToggle.getElementsByTagName(
          "span"
        )[0].innerHTML = SHOW_COURSE_INFO_TEXT
      } else {
        desktopCourseInfoToggle.getElementsByTagName(
          "span"
        )[0].innerHTML = HIDE_COURSE_INFO_TEXT
      }
      calculateTableResponsiveness()
    })
  }
}

function calculateTableResponsiveness() {
  const tables = document.querySelectorAll("#main-content table")
  const main = document.getElementById("main-content")
  if (!main) {
    throw new Error("Expected element to exist.")
  }
  const mainContentWidth = main.clientWidth

  tables.forEach(table => {
    if (table.clientWidth > mainContentWidth) {
      table.classList.add("mobile-table")
    } else {
      table.classList.remove("mobile-table")
    }
  })
}

export function closeToggleButton() {
  const tables = document.querySelectorAll("#main-content table")
  const main = document.getElementById("main-content")
  const toggleElement = document.getElementById("desktop-course-info-toggle")
  if (!(main && toggleElement)) {
    throw new Error("Expected element to exist.")
  }
  const mainContentWidth = main.clientWidth

  tables.forEach(table => {
    if (
      table.clientWidth > mainContentWidth &&
      toggleElement.innerText === "HIDE COURSE INFO"
    ) {
      toggleElement.click()
    }
  })
}
