// @ts-nocheck
function initResponsiveTables() {
  const tables = document
    .getElementById("main-content")
    .getElementsByTagName("table")
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
initResponsiveTables()
