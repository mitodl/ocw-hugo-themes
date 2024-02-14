import React, { useState } from "react"
import { contains } from "ramda"

import SearchFacetItem from "./SearchFacetItem"
import { Aggregation } from "@mitodl/course-search-utils"

const MAX_DISPLAY_COUNT = 5
const FACET_COLLAPSE_THRESHOLD = 15

interface Props {
  name: string
  title: string
  results: Aggregation | null
  currentlySelected: string[]
  onUpdate: React.ChangeEventHandler<HTMLInputElement>
  expandedOnLoad: boolean
  labelFunction?: ((value: string) => string | null) | null
}

function SearchFacet(props: Props) {
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
  const [showAllFacets, setShowAllFacets] = useState(false)

  const titleLineIcon = showFacetList ? "arrow_drop_down" : "arrow_right"

  return results && results.length === 0 ? null : (
    <div className="facets mb-3">
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
        <React.Fragment>
          {results ?
            results.map((facet, i) =>
              showAllFacets ||
                i < MAX_DISPLAY_COUNT ||
                results.length < FACET_COLLAPSE_THRESHOLD ? (
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
                ) : null
            ) :
            null}
          {results && results.length >= FACET_COLLAPSE_THRESHOLD ? (
            <button
              className="facet-more-less-button"
              onClick={() => setShowAllFacets(!showAllFacets)}
              type="button"
            >
              {showAllFacets ? "View less" : "View more"}
            </button>
          ) : null}
        </React.Fragment>
      ) : null}
    </div>
  )
}

export default SearchFacet
