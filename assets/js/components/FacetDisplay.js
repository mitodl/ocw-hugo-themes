import React from "react"
import flatten from "lodash.flatten"
import toArray from "lodash.toarray"

import FilterableFacet from "./FilterableFacet"
import Facet from "./Facet"
import SearchFilter from "./SearchFilter"

const FacetDisplay = React.memo(
  function FacetDisplay(props) {
    const {
      facetMap,
      facetOptions,
      activeFacets,
      onUpdateFacets,
      clearAllFilters,
      toggleFacet
    } = props

    const anyFiltersActive =
      flatten(toArray(Object.values(activeFacets))).length > 0

    return (
      <React.Fragment>
        {anyFiltersActive ? (
          <div className="active-search-filters">
            <div className="filter-section-title">
              Filters
              <span
                className="clear-all-filters"
                onClick={clearAllFilters}
                onKeyPress={e => {
                  if (e.key === "Enter") {
                    clearAllFilters()
                  }
                }}
                tabIndex="0"
              >
                Clear All
              </span>
            </div>
            {facetMap.map(([name, , , labelFunction]) =>
              (activeFacets[name] || []).map((facet, i) => (
                <SearchFilter
                  key={i}
                  value={facet}
                  clearFacet={() => toggleFacet(name, facet, false)}
                  labelFunction={labelFunction}
                />
              ))
            )}
          </div>
        ) : null}
        {facetMap.map(([name, title, useFilterableFacet], key) =>
          useFilterableFacet ? (
            <FilterableFacet
              key={key}
              results={facetOptions(name)}
              name={name}
              title={title}
              currentlySelected={activeFacets[name] || []}
              onUpdate={onUpdateFacets}
            />
          ) : (
            <Facet
              key={key}
              title={title}
              name={name}
              results={facetOptions(name)}
              onUpdate={onUpdateFacets}
              currentlySelected={activeFacets[name] || []}
            />
          )
        )}
      </React.Fragment>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.activeFacets === nextProps.activeFacets &&
      prevProps.clearAllFilters === nextProps.clearAllFilters &&
      prevProps.toggleFacet === nextProps.toggleFacet &&
      prevProps.facetOptions === nextProps.facetOptions &&
      prevProps.onUpdateFacets === nextProps.onUpdateFacets
    )
  }
)

export default FacetDisplay
