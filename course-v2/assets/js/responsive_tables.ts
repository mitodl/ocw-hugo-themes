function initResponsiveTables2() {
  const tables = document.querySelectorAll('#course-content-section table')
  tables.forEach(table => {
    const headings = table.querySelectorAll<HTMLElement>("thead th")
    const rows = table.querySelectorAll("tbody tr")
    // set data-title attribute on table cells
    rows.forEach(row => {
      const cells = row.querySelectorAll("td")
      cells.forEach((cell, i) => {
        if (headings.length >= i + 1) {
          cells[i].setAttribute(
            "data-title",
            headings[i].innerText.trim().concat(": ")
          )
        }
      })
    })
    // force mobile style if table width exceeds main content area
    const tableWidth = table.clientWidth
    const mainContentWidth = document.getElementById("course-content-section")
      ?.clientWidth ?? 0
    if (tableWidth > mainContentWidth) {
      table.classList.add("mobile-table")
    }
  })
}

initResponsiveTables2()
