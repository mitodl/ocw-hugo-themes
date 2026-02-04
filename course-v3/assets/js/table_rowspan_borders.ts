export const initTableRowspanBorders = () => {
  const tables = document.querySelectorAll(".course-main-content-v3 table")

  tables.forEach(table => {
    const tbody = table.querySelector("tbody")
    if (!tbody) {
      return
    }

    const rows = Array.from(tbody.querySelectorAll("tr"))
    const endRows = new Set<number>()
    // activeRowspans stores remaining rows including the current row.
    const activeRowspans: number[] = []
    let hasRowspans = false

    const parseSpan = (value: string | null) => {
      const parsed = value !== null ? parseInt(value, 10) : 1
      return !Number.isNaN(parsed) && parsed >= 1 ? parsed : 1
    }

    rows.forEach((row, rowIndex) => {

      const cells = Array.from(row.children).filter(
        child => child.tagName === "TD" || child.tagName === "TH"
      ) as HTMLTableCellElement[]

      let columnIndex = 0
      while (activeRowspans[columnIndex] > 0) {
        columnIndex += 1
      }

      if (columnIndex > 0) {
        row.classList.add("rowspan-continued-left")
      }

      cells.forEach(cell => {
        while (activeRowspans[columnIndex] > 0) {
          columnIndex += 1
        }

        const rowspan = parseSpan(cell.getAttribute("rowspan"))
        const colspan = parseSpan(cell.getAttribute("colspan"))

        if (rowspan > 1) {
          hasRowspans = true
          const endIndex = Math.min(rowIndex + rowspan - 1, rows.length - 1)
          if (endIndex > rowIndex) {
            endRows.add(endIndex)
          }
          for (let offset = 0; offset < colspan; offset += 1) {
            const spanIndex = columnIndex + offset
            activeRowspans[spanIndex] = rowspan
          }
        }

        columnIndex += colspan
      })

      for (let i = columnIndex; i < activeRowspans.length; i += 1) {
        if (activeRowspans[i] > 0) {
          row.classList.add("rowspan-continued-right")
          break
        }
      }

      // Decrement active rowspans after processing the current row.
      activeRowspans.forEach((span, index) => {
        if (span > 0) {
          activeRowspans[index] = span - 1
        }
      })
    })

    if (hasRowspans) {
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
