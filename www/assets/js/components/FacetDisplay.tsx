import React from "react"

import FilterableFacet from "./FilterableFacet"
import Facet from "./Facet"
import SearchFilter from "./SearchFilter"
import {
  Aggregation,
  Facets,
  LEVELS,
  DEPARTMENTS
} from "@mitodl/course-search-utils"
import type { FacetManifest } from "../LearningResources"
import { FACET_OPTIONS } from "../lib/constants"

interface Props {
  facetMap: FacetManifest
  facetOptions: (group: string) => Aggregation | null
  activeFacets: Facets
  onUpdateFacets: React.ChangeEventHandler<HTMLInputElement>
  clearAllFilters: () => void
  toggleFacet: (name: string, value: string, isEnabled: boolean) => void
}

const reverseObject = (
  stringObject: Record<string, string>
): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(stringObject).map(([key, value]) => [value, key])
  )
}

const sanitizeActiveFacets = (activeFacets: Facets): void => {
  const reverseLevels = reverseObject(LEVELS)
  const reverseDepartments = reverseObject(DEPARTMENTS)

  if (activeFacets) {
    Object.entries(activeFacets).forEach(([facet, values]) => {
      if (Object.keys(FACET_OPTIONS).indexOf(facet) > -1) {
        activeFacets[facet as keyof typeof activeFacets] = values.flatMap(
          (facetValue: string) => {
            if (
              // @ts-expect-error we checked that facet is also a key of FACET_OPTION
              FACET_OPTIONS[facet as keyof typeof FACET_OPTIONS].indexOf(
                facetValue
              ) > -1
            ) {
              return facetValue
            } else if (facet === "level" && facetValue in reverseLevels) {
              return reverseLevels[facetValue]
            } else if (
              facet === "department" &&
              facetValue in reverseDepartments
            ) {
              return reverseDepartments[facetValue]
            } else {
              return []
            }
          }
        )
      }
    })
  }
}

const departmentName = (departmentId: string): string | null => {
  if (departmentId in DEPARTMENTS) {
    return DEPARTMENTS[departmentId as keyof typeof DEPARTMENTS]
  } else {
    return departmentId
  }
}

const levelName = (levelValue: string): string | null => {
  if (levelValue in LEVELS) {
    return LEVELS[levelValue as keyof typeof LEVELS]
  } else {
    return levelValue
  }
}

const labels = (name: string): ((value: string) => string | null) | null => {
  if (name === "department") {
    return departmentName
  } else if (name === "level") {
    return levelName
  } else {
    return null
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
            <button
              className="clear-all-filters-button"
              type="button"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          </div>
          {facetMap.map(([name]) =>
            (activeFacets[name] || []).map((facet, i) => (
              <SearchFilter
                key={i}
                value={facet}
                clearFacet={() => toggleFacet(name, facet, false)}
                labelFunction={labels(name)}
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
                labelFunction={labels(name)}
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
                labelFunction={labels(name)}
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
