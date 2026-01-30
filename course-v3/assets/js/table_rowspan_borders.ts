export const initTableRowspanBorders = () => {
  const tables = document.querySelectorAll(".course-main-content-v3 table")

  tables.forEach(table => {
    const tbody = table.querySelector("tbody")
    if (!tbody) {
      return
    }

    const rows = Array.from(tbody.querySelectorAll("tr"))
    const endRows = new Set<number>()

    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll("td[rowspan], th[rowspan]"))
      cells.forEach(cell => {
        const rowspanValue = cell.getAttribute("rowspan")
        const rowspan = rowspanValue ? parseInt(rowspanValue, 10) : 1
        if (rowspan > 1) {
          endRows.add(rowIndex + rowspan - 1)
        }
      })
    })

    if (endRows.size > 0) {
      table.classList.add("has-rowspans")
    }

    endRows.forEach(index => {
      const row = rows[index]
      if (row) {
        row.classList.add("rowspan-end")
      }
    })
  })
}
