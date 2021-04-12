// @flow
import React, { useState } from "react"
import { contains } from "ramda"
import has from "lodash.has"

import SearchFacetItem from "./SearchFacetItem"

const MAX_DISPLAY_COUNT = 5
const FACET_COLLAPSE_THRESHOLD = 15

function SearchFacet(props) {
  const {
    name,
    title,
    results,
    currentlySelected,
    onUpdate,
    labelFunction
  } = props

  const [showFacetList, setShowFacetList] = useState(true)
  const [showAllFacets, setShowAllFacets] = useState(false)

  const titleLineIcon = showFacetList ? "arrow_drop_down" : "arrow_drop_up"

  return results && results.buckets && results.buckets.length === 0 ? null : (
    <div className="facets pb-3">
      <div
        className="filter-section-title"
        onClick={() => setShowFacetList(!showFacetList)}
      >
        {title}
        <i className={`material-icons ${titleLineIcon}`}>{titleLineIcon}</i>
      </div>
      {showFacetList ? (
        <React.Fragment>
          {results && results.buckets ?
            results.buckets.map((facet, i) =>
              showAllFacets ||
                i < MAX_DISPLAY_COUNT ||
                results.buckets.length < FACET_COLLAPSE_THRESHOLD ? (
                  <SearchFacetItem
                    key={i}
                    facet={facet}
                    isChecked={contains(facet.key, currentlySelected || [])}
                    onUpdate={onUpdate}
                    name={name}
                    labelFunction={labelFunction}
                  />
                ) : null
            ) :
            null}
          {results && results.buckets.length >= FACET_COLLAPSE_THRESHOLD ? (
            <div
              className={"facet-more-less"}
              onClick={() => setShowAllFacets(!showAllFacets)}
            >
              {showAllFacets ? "View less" : "View more"}
            </div>
          ) : null}
        </React.Fragment>
      ) : null}
    </div>
  )
}

const propsAreEqual = (prevProps, nextProps) => {
  // results.buckets is null while the search request is in-flight
  // we want to defer rendering in that case because it will cause
  // all the facets to briefly disappear before reappearing
  return !has(nextProps.results, "buckets")
}

export default React.memo(SearchFacet, propsAreEqual)
