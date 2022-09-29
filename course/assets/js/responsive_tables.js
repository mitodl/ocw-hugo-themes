// @ts-nocheck
function initResponsiveTables() {
  const tables = document
    .getElementById("main-content")
    .getElementsByTagName("table")

  const observer = new ResizeObserver(() => calculateOverlap())
  observer.observe(document.getElementById("main-content"))
  for (const table of tables) {
    const headings = table.getElementsByTagName("th")
    const tbody = table.getElementsByTagName("tbody")[0]
    const rows = tbody.getElementsByTagName("tr")
    // set data-title attribute on table cells
    for (const row of rows) {
      const cells = row.getElementsByTagName("td")
      for (let i = 0; i < cells.length; i++) {
        if (headings.length >= i + 1) {
          cells[i].setAttribute(
            "data-title",
            headings[i].innerText.trim().concat(": ")
          )
        }
      }
    }
  }
}

function calculateOverlap() {
  const table = document
    .getElementById("main-content")
    .getElementsByTagName("table")[0]

  if (table.classList.contains("mobile-table")) return

  const courseInfo = document.getElementById("desktop-course-info")
  const rect1 = table.getBoundingClientRect()
  const rect2 = courseInfo.getBoundingClientRect()
  const overlap = !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  )
  if (overlap) {
    table.classList.add("mobile-table")
  }
}

initResponsiveTables()
