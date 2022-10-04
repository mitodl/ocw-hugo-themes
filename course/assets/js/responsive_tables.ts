function initResponsiveTables() {
  const tables = document.querySelectorAll("#main-content table")

  const observer = new ResizeObserver(() => calculateOverlap())
  const mainContent = document.getElementById("main-content")
  if (!mainContent) {
    throw new Error("Expected element to exist.")
  }
  observer.observe(mainContent)
  tables.forEach(table => {
    const headings = table.getElementsByTagName("th")
    const rows = table.querySelectorAll("table tr")
    // set data-title attribute on table cells
    rows.forEach(row => {
      const cells = row.querySelectorAll("td")
      cells.forEach((cell, i) => {
        if (headings.length >= i + 1) {
          cells[i].dataset["title"] = headings[i].innerText.trim().concat(": ")
        }
      })
    })
  })
}

function calculateOverlap() {
  const tables = document.querySelectorAll("#main-content table")

  tables.forEach(table => {
    if (table.classList.contains("mobile-table")) return
    const courseInfo = document.getElementById("desktop-course-info")
    if (!courseInfo) return
    if (!courseInfo) {
      throw new Error("Expected element to exist.")
    }
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
  })
}

initResponsiveTables()
