import React from "react"

interface Props {
  value: string
  labelFunction?: (value: string) => string
  clearFacet: () => void
}

export default function SearchFilter(props: Props) {
  const { value, clearFacet, labelFunction } = props

  return (
    <div className="active-search-filter" aria-label="active search filters">
      <div>{labelFunction ? labelFunction(value) : value}</div>
      <button
        className="remove-filter-button"
        type="button"
        onClick={clearFacet}
        onKeyPress={e => {
          if (e.key === "Enter") {
            clearFacet()
          }
        }}
      >
        <span className="material-icons">close</span>
      </button>
    </div>
  )
}
