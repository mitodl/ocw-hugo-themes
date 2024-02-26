import React, { useState } from "react"
import { includes } from "ramda"
import has from "lodash.has"

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
}

function SearchFacet(props: Props) {
  const { name, title, results, currentlySelected, onUpdate, expandedOnLoad } =
    props

  const [showFacetList, setShowFacetList] = useState(expandedOnLoad)
  const [showAllFacets, setShowAllFacets] = useState(false)

  const titleLineIcon = showFacetList ? "arrow_drop_down" : "arrow_right"

  return results && results.buckets && results.buckets.length === 0 ? null : (
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
          {results && results.buckets ?
            results.buckets.map((facet, i) =>
              showAllFacets ||
                i < MAX_DISPLAY_COUNT ||
                results.buckets.length < FACET_COLLAPSE_THRESHOLD ? (
                  <SearchFacetItem
                    key={i}
                    facet={facet}
                    isChecked={includes(facet.key, currentlySelected || [])}
                    onUpdate={onUpdate}
                    name={name}
                  />
                ) : null
            ) :
            null}
          {results && results.buckets.length >= FACET_COLLAPSE_THRESHOLD ? (
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

const propsAreEqual = (_prevProps: Props, nextProps: Props) => {
  // results.buckets is null while the search request is in-flight
  // we want to defer rendering in that case because it will cause
  // all the facets to briefly disappear before reappearing
  return !has(nextProps.results, "buckets")
}

export default React.memo(SearchFacet, propsAreEqual)
