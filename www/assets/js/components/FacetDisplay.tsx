import React from "react"

import FilterableFacet from "./FilterableFacet"
import Facet from "./Facet"
import SearchFilter from "./SearchFilter"
import { Aggregation, Facets } from "@mitodl/course-search-utils"
import { FacetManifest } from "../LearningResources"
import { FACET_OPTIONS } from "../lib/constants"

interface Props {
  facetMap: FacetManifest
  facetOptions: (group: string) => Aggregation | null
  activeFacets: Facets
  onUpdateFacets: React.ChangeEventHandler<HTMLInputElement>
  clearAllFilters: () => void
  toggleFacet: (name: string, value: string, isEnabled: boolean) => void
}

const sanitizeActiveFacets = (activeFacets: Facets): void => {
  if (activeFacets) {
    Object.entries(activeFacets).forEach(([facet, values]) => {
      if (Object.keys(FACET_OPTIONS).indexOf(facet) > -1) {
        // @ts-expect-error TODO facet is a key of activeFacets
        activeFacets[facet] = values.filter(
          // @ts-expect-error TODO we checked that facet is also a key of FACET_OPTIONS
          facetValue => FACET_OPTIONS[facet].indexOf(facetValue) > -1
        )
      }
    })
  }
}

const FacetDisplay = React.memo(
  function FacetDisplay(props: Props) {
    const {
      facetMap,
      facetOptions,
      activeFacets,
      onUpdateFacets,
      clearAllFilters,
      toggleFacet
    } = props

    sanitizeActiveFacets(activeFacets)

    return (
      <React.Fragment>
        <div className="active-search-filters">
          <div className="filter-section-main-title">
            Filters
            <span
              className="clear-all-filters"
              onClick={clearAllFilters}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  clearAllFilters()
                }
              }}
              tabIndex={0}
            >
              Clear All
            </span>
          </div>
          {facetMap.map(([name]) =>
            (activeFacets[name] || []).map((facet, i) => (
              <SearchFilter
                key={i}
                value={facet}
                clearFacet={() => toggleFacet(name, facet, false)}
              />
            ))
          )}
        </div>
        {facetMap.map(
          ([name, title, useFilterableFacet, expandedOnLoad], key) =>
            useFilterableFacet ? (
              <FilterableFacet
                key={key}
                results={facetOptions(name)}
                name={name}
                title={title}
                currentlySelected={activeFacets[name] || []}
                onUpdate={onUpdateFacets}
                expandedOnLoad={expandedOnLoad}
              />
            ) : (
              <Facet
                key={key}
                title={title}
                name={name}
                results={facetOptions(name)}
                onUpdate={onUpdateFacets}
                currentlySelected={activeFacets[name] || []}
                expandedOnLoad={expandedOnLoad}
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
