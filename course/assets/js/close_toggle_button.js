// @ts-nocheck
export function closeToggleButton() {
  const tables = document
    .getElementById("main-content")
    .getElementsByTagName("table")
  const mainContentWidth = document.getElementById("main-content").clientWidth
  const toggleElement = document.getElementById("desktop-course-info-toggle")
  for (const item of tables) {
    if (
      item.clientWidth > mainContentWidth &&
      toggleElement.innerText === "HIDE COURSE INFO"
    ) {
      toggleElement.click()
      break
    }
  }
}
