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
      <div
        className="remove-filter"
        onClick={clearFacet}
        onKeyPress={e => {
          if (e.key === "Enter") {
            clearFacet()
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="close"
      >
        <i className="material-icons" aria-hidden="true">
          close
        </i>
      </div>
    </div>
  )
}
