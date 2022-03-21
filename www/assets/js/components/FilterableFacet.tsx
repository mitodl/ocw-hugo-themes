import React, { useState, useEffect, useCallback } from "react"
import { contains } from "ramda"
import has from "lodash.has"
import Fuse from "fuse.js"

import SearchFacetItem from "./SearchFacetItem"
import { Aggregation } from "@mitodl/course-search-utils"
import { Bucket } from "../lib/search"

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
}

function FilterableSearchFacet(props: Props) {
  const { name, title, results, currentlySelected, onUpdate } = props
  const [showFacetList, setShowFacetList] = useState(true)

  // null is signal for no input yet or cleared input
  const [filteredList, setFilteredList] = useState<Bucket[] | null>(null)
  const [searcher, setSearcher] = useState<Fuse<Bucket>>(new Fuse([]))

  const [filterText, setFilterText] = useState("")

  useEffect(() => {
    if (results && results.buckets) {
      const searcher = new Fuse(results.buckets, {
        keys: ["key"],
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

  const facets = (filteredList || results?.buckets) ?? []

  return results && results.buckets && results.buckets.length === 0 ? null : (
    <div className="facets filterable-facet mb-3">
      <div
        className="filter-section-title pl-3 pt-2 pb-2"
        onClick={() => setShowFacetList(!showFacetList)}
      >
        {title}
        <i className={`material-icons ${titleLineIcon}`}>{titleLineIcon}</i>
      </div>
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
              <i className="material-icons search-icon mt-1">search</i>
            ) : (
              <i
                className="material-icons clear-icon"
                onClick={() => setFilterText("")}
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    setFilterText("")
                  }
                }}
                tabIndex={0}
              >
                clear
              </i>
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
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

const propsAreEqual = (_prevProps: Props, nextProps: Props) => {
  // results.buckets is null while the search request is in-flight
  // we want to defer rendering in that case because it will cause
  // all the facets to briefly disappear before reappearing
  return !has(nextProps.results, "buckets")
}

export default React.memo(FilterableSearchFacet, propsAreEqual)
