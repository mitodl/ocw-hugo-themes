// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { initTableRowspanBorders } from "./table_rowspan_borders"

describe("initTableRowspanBorders", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  const createTable = (html: string) => {
    document.body.innerHTML = `
      <div class="course-main-content-v3">
        <table>
          <tbody>
            ${html}
          </tbody>
        </table>
      </div>
    `
    return document.querySelector("table")
  }

  describe("table without rowspans", () => {
    it("does not add has-rowspans class", () => {
      const table = createTable(`
        <tr><td>A</td><td>B</td><td>C</td></tr>
        <tr><td>D</td><td>E</td><td>F</td></tr>
      `)
      initTableRowspanBorders()
      expect(table.classList.contains("has-rowspans")).toBe(false)
    })

    it("does not add border classes to cells", () => {
      const table = createTable(`
        <tr><td>A</td><td>B</td><td>C</td></tr>
        <tr><td>D</td><td>E</td><td>F</td></tr>
      `)
      initTableRowspanBorders()
      const cells = table.querySelectorAll("td")
      cells.forEach(cell => {
        expect(cell.classList.contains("rowspan-border-left")).toBe(false)
        expect(cell.classList.contains("rowspan-border-right")).toBe(false)
      })
    })
  })

  describe("table with rowspans", () => {
    it("adds has-rowspans class when table has rowspan > 1", () => {
      const table = createTable(`
        <tr><td rowspan="2">A</td><td>B</td><td>C</td></tr>
        <tr><td>E</td><td>F</td></tr>
      `)
      initTableRowspanBorders()
      expect(table.classList.contains("has-rowspans")).toBe(true)
    })

    it("adds rowspan-border-left to first column cells", () => {
      const table = createTable(`
        <tr><td rowspan="2">A</td><td>B</td><td>C</td></tr>
        <tr><td>E</td><td>F</td></tr>
      `)
      initTableRowspanBorders()
      const firstCell = table.querySelector("tr:first-child td:first-child")
      expect(firstCell.classList.contains("rowspan-border-left")).toBe(true)
    })

    it("adds rowspan-border-right to last column cells", () => {
      const table = createTable(`
        <tr><td rowspan="2">A</td><td>B</td><td>C</td></tr>
        <tr><td>E</td><td>F</td></tr>
      `)
      initTableRowspanBorders()
      const lastCellRow1 = table.querySelector("tr:first-child td:last-child")
      const lastCellRow2 = table.querySelector("tr:last-child td:last-child")
      expect(lastCellRow1.classList.contains("rowspan-border-right")).toBe(true)
      expect(lastCellRow2.classList.contains("rowspan-border-right")).toBe(true)
    })

    it("adds border classes at rowspan column boundaries", () => {
      const table = createTable(`
        <tr><td rowspan="2">A</td><td>B</td><td>C</td></tr>
        <tr><td>E</td><td>F</td></tr>
      `)
      initTableRowspanBorders()
      // Cell A spans column 0, so boundary is at column 1
      // Cell E starts at column 1, so it should have rowspan-border-left
      const cellE = table.querySelector("tr:last-child td:first-child")
      expect(cellE.classList.contains("rowspan-border-left")).toBe(true)
    })

    it("avoids double borders between rowspan and adjacent cells", () => {
      const table = createTable(`
        <tr><td>A</td><td rowspan="2">B</td><td>C</td></tr>
        <tr><td>D</td><td>E</td></tr>
      `)
      initTableRowspanBorders()
      // Cell B (rowspan) should not have right border since C will have left border
      const cellB = table.querySelector("tr:first-child td:nth-child(2)")
      const cellC = table.querySelector("tr:first-child td:nth-child(3)")
      expect(cellB.classList.contains("rowspan-border-right")).toBe(false)
      expect(cellC.classList.contains("rowspan-border-left")).toBe(true)
    })
  })

  describe("table with multiple rowspans", () => {
    it("handles multiple rowspan cells in the same row", () => {
      const table = createTable(`
        <tr><td rowspan="2">A</td><td rowspan="2">B</td><td>C</td></tr>
        <tr><td>F</td></tr>
      `)
      initTableRowspanBorders()
      expect(table.classList.contains("has-rowspans")).toBe(true)
      // Cell F is at column 2, which is a boundary for rowspan B
      const cellF = table.querySelector("tr:last-child td:first-child")
      expect(cellF.classList.contains("rowspan-border-left")).toBe(true)
    })

    it("handles rowspans in different columns", () => {
      const table = createTable(`
        <tr><td>A</td><td rowspan="2">B</td><td>C</td></tr>
        <tr><td>D</td><td>F</td></tr>
      `)
      initTableRowspanBorders()
      expect(table.classList.contains("has-rowspans")).toBe(true)
    })

    it("adds both left and right borders to rowspan cells in last column", () => {
      const table = createTable(`
        <tr><td>A</td><td rowspan="2">B</td></tr>
        <tr><td>C</td></tr>
      `)
      initTableRowspanBorders()
      const lastColumnCell = table.querySelector("tr:first-child td:last-child")
      expect(lastColumnCell.classList.contains("rowspan-border-left")).toBe(
        true
      )
      expect(lastColumnCell.classList.contains("rowspan-border-right")).toBe(
        true
      )
    })
  })

  describe("table with colspan and rowspan", () => {
    it("handles cells with both colspan and rowspan", () => {
      const table = createTable(`
        <tr><td colspan="2" rowspan="2">A</td><td>C</td></tr>
        <tr><td>F</td></tr>
        <tr><td>G</td><td>H</td><td>I</td></tr>
      `)
      initTableRowspanBorders()
      expect(table.classList.contains("has-rowspans")).toBe(true)
    })

    it("correctly calculates column positions with colspan", () => {
      const table = createTable(`
        <tr><td colspan="2">A</td><td>C</td></tr>
        <tr><td rowspan="2">D</td><td>E</td><td>F</td></tr>
        <tr><td>H</td><td>I</td></tr>
      `)
      initTableRowspanBorders()
      expect(table.classList.contains("has-rowspans")).toBe(true)
    })

    it("applies border at boundary after colspan with rowspan", () => {
      const table = createTable(`
        <tr><td colspan="2" rowspan="2">A</td><td>B</td></tr>
        <tr><td>C</td></tr>
        <tr><td>D</td><td>E</td><td>F</td></tr>
      `)
      initTableRowspanBorders()
      // Cell C starts where the colspan+rowspan ends, so needs left border
      const cellAfterColspan = table.querySelector(
        "tr:nth-child(2) td:first-child"
      )
      expect(cellAfterColspan.classList.contains("rowspan-border-left")).toBe(
        true
      )
    })
  })

  describe("table with th elements", () => {
    it("handles th elements with rowspan", () => {
      const table = createTable(`
        <tr><th rowspan="2">A</th><td>B</td><td>C</td></tr>
        <tr><td>E</td><td>F</td></tr>
      `)
      initTableRowspanBorders()
      expect(table.classList.contains("has-rowspans")).toBe(true)
      const thCell = table.querySelector("th")
      expect(thCell.classList.contains("rowspan-border-left")).toBe(true)
    })
  })

  describe("edge cases", () => {
    it("skips tables outside course-main-content-v3", () => {
      document.body.innerHTML = `
        <div class="other-content">
          <table>
            <tbody>
              <tr><td rowspan="2">A</td><td>B</td></tr>
              <tr><td>E</td></tr>
            </tbody>
          </table>
        </div>
      `
      const table = document.querySelector("table")
      initTableRowspanBorders()
      // Should not process tables outside the target selector
      expect(table.classList.contains("has-rowspans")).toBe(false)
    })

    it("handles empty table", () => {
      const table = createTable("")
      initTableRowspanBorders()
      expect(table.classList.contains("has-rowspans")).toBe(false)
    })

    it("handles rowspan=1 (no special treatment)", () => {
      const table = createTable(`
        <tr><td rowspan="1">A</td><td>B</td></tr>
        <tr><td>D</td><td>E</td></tr>
      `)
      initTableRowspanBorders()
      expect(table.classList.contains("has-rowspans")).toBe(false)
    })

    it("handles invalid rowspan values gracefully", () => {
      const table = createTable(`
        <tr><td rowspan="invalid">A</td><td>B</td></tr>
        <tr><td>D</td><td>E</td></tr>
      `)
      initTableRowspanBorders()
      // Invalid rowspan should be treated as 1, so no has-rowspans
      expect(table.classList.contains("has-rowspans")).toBe(false)
    })

    it("handles rowspan=0 gracefully", () => {
      const table = createTable(`
        <tr><td rowspan="0">A</td><td>B</td></tr>
        <tr><td>D</td><td>E</td></tr>
      `)
      initTableRowspanBorders()
      // rowspan=0 is invalid, should be treated as 1
      expect(table.classList.contains("has-rowspans")).toBe(false)
    })

    it("handles negative rowspan gracefully", () => {
      const table = createTable(`
        <tr><td rowspan="-1">A</td><td>B</td></tr>
        <tr><td>D</td><td>E</td></tr>
      `)
      initTableRowspanBorders()
      // Negative rowspan is invalid, should be treated as 1
      expect(table.classList.contains("has-rowspans")).toBe(false)
    })
  })

  describe("rows without rowspans after rowspan groups", () => {
    it("maintains vertical borders in rows following rowspan groups", () => {
      const table = createTable(`
        <tr><td rowspan="2">A</td><td>B</td><td>C</td></tr>
        <tr><td>D</td><td>E</td></tr>
        <tr><td>F</td><td>G</td><td>H</td></tr>
        <tr><td>I</td><td>J</td><td>K</td></tr>
      `)
      initTableRowspanBorders()
      // Cells in column 1 (where rowspan was) should maintain borders in subsequent rows
      const row3Col1 = table.querySelector("tr:nth-child(3) td:nth-child(2)")
      const row4Col1 = table.querySelector("tr:nth-child(4) td:nth-child(2)")
      expect(row3Col1.classList.contains("rowspan-border-left")).toBe(true)
      expect(row4Col1.classList.contains("rowspan-border-left")).toBe(true)
    })
  })

  describe("multiple tables", () => {
    it("processes all tables in the content area", () => {
      document.body.innerHTML = `
        <div class="course-main-content-v3">
          <table id="table1">
            <tbody>
              <tr><td rowspan="2">A</td><td>B</td></tr>
              <tr><td>E</td></tr>
            </tbody>
          </table>
          <table id="table2">
            <tbody>
              <tr><td>X</td><td>Y</td></tr>
            </tbody>
          </table>
        </div>
      `
      initTableRowspanBorders()
      const table1 = document.querySelector("#table1")
      const table2 = document.querySelector("#table2")
      expect(table1.classList.contains("has-rowspans")).toBe(true)
      expect(table2.classList.contains("has-rowspans")).toBe(false)
    })
  })

  describe("class removal on re-run", () => {
    it("removes old border classes before reapplying", () => {
      const table = createTable(`
        <tr><td rowspan="2">A</td><td>B</td><td>C</td></tr>
        <tr><td>E</td><td>F</td></tr>
      `)

      // Run once
      initTableRowspanBorders()
      const cellA = table.querySelector("tr:first-child td:first-child")
      expect(cellA.classList.contains("rowspan-border-left")).toBe(true)

      // Manually add a class that should be removed
      const cellE = table.querySelector("tr:last-child td:first-child")
      cellE.classList.add("rowspan-border-right")

      // Run again
      initTableRowspanBorders()

      // The incorrectly added class should be removed
      expect(cellE.classList.contains("rowspan-border-right")).toBe(false)
    })
  })
})
