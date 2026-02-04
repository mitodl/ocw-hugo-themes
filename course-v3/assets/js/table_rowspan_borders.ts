export const initTableRowspanBorders = () => {
  const tables = document.querySelectorAll(".course-main-content-v3 table")

  tables.forEach(table => {
    const tbody = table.querySelector("tbody")
    if (!tbody) {
      return
    }

    const rows = Array.from(tbody.querySelectorAll("tr"))
    const endRows = new Set<number>()
    const rowData: Array<{
      row: HTMLTableRowElement
      cells: Array<{
        cell: HTMLTableCellElement
        colStart: number
        colEnd: number
        rowspan: number
        colspan: number
      }>
    }> = []
    const rowspanColumns = new Set<number>()
    // activeRowspans stores remaining rows including the current row.
    const activeRowspans: number[] = []
    let hasRowspans = false
    let colCount = 0

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

      const rowCells: Array<{
        cell: HTMLTableCellElement
        colStart: number
        colEnd: number
        rowspan: number
        colspan: number
      }> = []

      cells.forEach(cell => {
        while (activeRowspans[columnIndex] > 0) {
          columnIndex += 1
        }

        const rowspan = parseSpan(cell.getAttribute("rowspan"))
        const colspan = parseSpan(cell.getAttribute("colspan"))

        rowCells.push({
          cell,
          colStart: columnIndex,
          colEnd: columnIndex + colspan,
          rowspan,
          colspan
        })

        if (rowspan > 1) {
          hasRowspans = true
          const endIndex = Math.min(rowIndex + rowspan - 1, rows.length - 1)
          if (endIndex > rowIndex) {
            endRows.add(endIndex)
          }
          for (let offset = 0; offset < colspan; offset += 1) {
            const spanIndex = columnIndex + offset
            rowspanColumns.add(spanIndex)
            activeRowspans[spanIndex] = Math.max(
              activeRowspans[spanIndex] || 0,
              rowspan
            )
          }
        }

        columnIndex += colspan
      })

      rowData.push({ row, cells: rowCells })
      colCount = Math.max(colCount, columnIndex, activeRowspans.length)

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

    table.classList.toggle("has-rowspans", hasRowspans)

    endRows.forEach(index => {
      const row = rows[index]
      if (row) {
        row.classList.add("rowspan-end")
      }
    })

    rowData.forEach(({ cells }) => {
      cells.forEach(({ cell }) => {
        cell.classList.remove("rowspan-border-left", "rowspan-border-right")
      })
    })

    if (!hasRowspans) {
      return
    }

    const boundaryIndexes = new Set<number>()
    boundaryIndexes.add(0)
    boundaryIndexes.add(colCount)
    rowspanColumns.forEach(columnIndex => {
      boundaryIndexes.add(columnIndex)
      boundaryIndexes.add(columnIndex + 1)
    })

    rowData.forEach(({ cells }) => {
      cells.forEach(({ cell, colStart, colEnd }) => {
        if (boundaryIndexes.has(colStart)) {
          cell.classList.add("rowspan-border-left")
        }

        if (boundaryIndexes.has(colEnd) && colEnd === colCount) {
          cell.classList.add("rowspan-border-right")
        }
      })
    })
  })
}
