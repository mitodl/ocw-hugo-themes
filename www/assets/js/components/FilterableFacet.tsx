import React, { useState, useEffect, useCallback } from "react"
import { contains } from "ramda"
import Fuse from "fuse.js"

import SearchFacetItem from "./SearchFacetItem"
import { Aggregation, Bucket } from "@mitodl/course-search-utils"

// the `.search method returns records like { item, refindex }
// where item is the facet and refIndex is it's index in the original
// array. this helper just pulls out only the facets themselves
const runSearch = (searcher: Fuse<Bucket>, text: string) =>
  searcher.search(text).map(({ item }) => item)

interface Props {
  name: string
  title: string
  results: Aggregation | null
  currentlySelected: string[]
  onUpdate: React.ChangeEventHandler<HTMLInputElement>
  expandedOnLoad: boolean
  labelFunction?: ((value: string) => string | null) | null
}

function FilterableSearchFacet(props: Props) {
  const {
    name,
    title,
    results,
    currentlySelected,
    onUpdate,
    expandedOnLoad,
    labelFunction
  } = props
  const [showFacetList, setShowFacetList] = useState(expandedOnLoad)

  // null is signal for no input yet or cleared input
  const [filteredList, setFilteredList] = useState<Aggregation | null>(null)
  const [searcher, setSearcher] = useState<Fuse<Bucket>>(new Fuse([]))

  const [filterText, setFilterText] = useState("")

  useEffect(() => {
    if (results) {
      const searcher = new Fuse(results, {
        keys:      ["key"],
        threshold: 0.4
      })
      setSearcher(searcher)
    }
  }, [results])

  useEffect(() => {
    if (filterText === "") {
      setFilteredList(null)
    } else {
      setFilteredList(runSearch(searcher, filterText))
    }
  }, [searcher, filterText])

  const handleFilterInput = useCallback(e => {
    e.preventDefault()
    const filterText = e.target.value
    setFilterText(filterText)
  }, [])

  const titleLineIcon = showFacetList ? "arrow_drop_down" : "arrow_right"

  const facets = (filteredList || results) ?? []
  return results && results.length === 0 ? null : (
    <div className="facets filterable-facet mb-3">
      <button
        className="filter-section-button pl-3 py-2 pr-0"
        type="button"
        aria-expanded={showFacetList ? "true" : "false"}
        onClick={() => setShowFacetList(!showFacetList)}
      >
        {title}
        <i className={`material-icons ${titleLineIcon}`} aria-hidden="true">
          {titleLineIcon}
        </i>
      </button>
      {showFacetList ? (
        <>
          <div className="input-wrapper">
            <input
              className="facet-filter"
              type="text"
              onChange={handleFilterInput}
              value={filterText}
              placeholder={`Search ${title || ""}`}
            />
            {filterText === "" ? (
              <i
                className="input-postfix-icon material-icons search-icon mt-1"
                aria-hidden="true"
              >
                search
              </i>
            ) : (
              <button
                className="input-postfix-button"
                type="button"
                onClick={() => setFilterText("")}
                aria-label="clear search text"
              >
                <span className="material-icons" aria-hidden="true">
                  clear
                </span>
              </button>
            )}
          </div>
          <div className="facet-list">
            {facets.map((facet, i) => (
              <SearchFacetItem
                key={i}
                facet={facet}
                isChecked={contains(facet.key, currentlySelected || [])}
                onUpdate={onUpdate}
                name={name}
                displayKey={
                  labelFunction ? labelFunction(facet.key) : facet.key
                }
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default FilterableSearchFacet
