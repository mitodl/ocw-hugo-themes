import React from "react"

export default function SearchFilter(props) {
  const { value, clearFacet, labelFunction } = props

  return (
    <div className="active-search-filter">
      <div>{labelFunction ? labelFunction(value) : value}</div>
      <div
        className="remove-filter"
        onClick={clearFacet}
        onKeyPress={e => {
          if (e.key === "Enter") {
            clearFacet()
          }
        }}
        tabIndex="0"
      >
        <i className="material-icons">close</i>
      </div>
    </div>
  )
}
