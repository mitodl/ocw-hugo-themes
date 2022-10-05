const getTables = () => document.querySelectorAll<HTMLElement>("#course-content-section table")
const getCourseContent = () => document.getElementById("course-content-section")

function initResponsiveTables2() {
  const tables = getTables()
  const mainContent = getCourseContent()
  if (!mainContent) return
  if (!window.ResizeObserver) return

  const observer = new ResizeObserver(() => calculateOverlap2())
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

function calculateOverlap2() {
  const tables = getTables()
  const mainContent = getCourseContent()
  if (!mainContent) return

  tables.forEach(table => {
    const mainRect = mainContent.getBoundingClientRect()
    const tableMinWidth = +(table.dataset.minWidth ?? 0)
    if (mainRect.width > tableMinWidth) {
      table.classList.remove('mobile-table')
    }
    const tableRect = table.getBoundingClientRect()
    if (tableRect.right > mainRect.right) {
      table.dataset.minWidth = `${tableRect.width}`
      table.classList.add("mobile-table")
    }
  })
}

initResponsiveTables2()
