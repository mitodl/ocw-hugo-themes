import React, { useState, useCallback } from "react"
import InfiniteScroll from "react-infinite-scroller"
import { Aggregations, useCourseSearch } from "@mitodl/course-search-utils"
import {
  Facets,
  serializeSort
} from "@mitodl/course-search-utils/dist/url_utils"
import { without } from "ramda"

import SearchResult from "./SearchResult"
import SearchBox from "./SearchBox"
import SearchFilterDrawer from "./SearchFilterDrawer"
import Loading, { Spinner } from "./Loading"

import { search } from "../lib/api"
import { searchResultToLearningResource } from "../lib/search"
import { COURSENUM_SORT_FIELD } from "../lib/constants"
import { emptyOrNil, isDoubleQuoted } from "../lib/util"
import { FacetManifest, LearningResourceResult } from "../LearningResources"
import { LearningResourceType } from "@mitodl/course-search-utils/dist/constants"

export const SEARCH_PAGE_SIZE = 10

const COURSE_FACETS: FacetManifest = [
  ["level", "Level", false],
  ["topics", "Topics", true],
  ["course_feature_tags", "Features", true],
  ["department_name", "Departments", true]
]

const RESOURCE_FACETS: FacetManifest = [
  ["resource_type", "Resource Types", true],
  ["topics", "Topics", true]
]

interface Result {
  _source: LearningResourceResult
}

export default function SearchPage() {
  const [results, setSearchResults] = useState<Result[]>([])
  const [aggregations, setAggregations] = useState<Aggregations>(new Map())
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [completedInitialLoad, setCompletedInitialLoad] = useState(false)
  const [requestInFlight, setRequestInFlight] = useState(false)

  const runSearch = useCallback(
    async (text, activeFacets, from, sort) => {
      if (activeFacets && activeFacets.type.length > 1) {
        // Default is LR_TYPE_ALL, don't want that here. course or resourcefile only
        activeFacets["type"] = [LearningResourceType.Course]
      }

      setRequestInFlight(true)
      const newResults = await search({
        text,
        from,
        activeFacets,
        size: SEARCH_PAGE_SIZE,
        sort: sort
      })
      setRequestInFlight(false)

      const { suggest } = newResults
      if (!emptyOrNil(suggest) && !emptyOrNil(text)) {
        setSuggestions(
          without(
            [
              text
                .toLowerCase()
                .trim()
                .replace(/^"(.*)"$/, "$1")
                .replace(/[\W]+/g, " ")
                .trim()
            ],
            suggest
          ).map(suggestion =>
            isDoubleQuoted(text) ? `"${suggestion}"` : suggestion
          )
        )
      } else {
        setSuggestions([])
      }

      setAggregations(new Map(Object.entries(newResults.aggregations ?? {})))

      setSearchResults(results =>
        from === 0
          ? newResults.hits.hits
          : [...results, ...newResults.hits.hits]
      )
      setTotal(newResults.hits.total)
      setCompletedInitialLoad(true)
    },
    [
      setSearchResults,
      setTotal,
      setCompletedInitialLoad,
      setSuggestions,
      setRequestInFlight
    ]
  )

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setCompletedInitialLoad(false)
    setTotal(0)
  }, [setSearchResults, setCompletedInitialLoad, setTotal])

  const {
    facetOptions,
    onUpdateFacets,
    updateText,
    updateSort,
    loadMore,
    text,
    sort,
    activeFacets,
    onSubmit,
    from,
    toggleFacets,
    toggleFacet,
    clearAllFilters,
    acceptSuggestion
  } = useCourseSearch(
    runSearch,
    clearSearch,
    aggregations,
    // this is the 'loaded' value, which is what useCourseSearch uses
    // to determine whether to fire off a request or not.
    completedInitialLoad && !requestInFlight,
    SEARCH_PAGE_SIZE
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleResourceSearch = useCallback(
    nextResourceFilterState => async () => {
      if (isResourceFilterActive() === nextResourceFilterState) {
        // Immediately return in case the user clicks and already active facet.
        // Github issue https://github.com/mitodl/ocw-hugo-themes/issues/105
        return
      }
      const toggledFacets: [string, string, boolean][] = [
        ["type", LearningResourceType.ResourceFile, nextResourceFilterState],
        ["type", LearningResourceType.Course, !nextResourceFilterState]
      ]
      // Remove any facets not relevant to the new search type
      const newFacets: Map<string, string> = new Map(
        // @ts-ignore
        nextResourceFilterState ? RESOURCE_FACETS : COURSE_FACETS
      )

      Object.entries(activeFacets).forEach(([key, list]) => {
        if (!newFacets.has(key) && !emptyOrNil(list)) {
          list.forEach((value: string) => {
            toggledFacets.push([key, value, false])
          })
        }
      })
      toggleFacets(toggledFacets)
    },
    [toggleFacets, activeFacets]
  )

  const isResourceFilterActive = (): boolean => {
    const activeType = activeFacets.type ?? []
    return activeType && activeType.includes(LearningResourceType.ResourceFile)
  }

  const isResourceSearch = (activeFacets.type ?? []).includes(
    LearningResourceType.ResourceFile
  )
  const facetMap = isResourceSearch ? RESOURCE_FACETS : COURSE_FACETS

  return (
    <div className="search-page w-100">
      <div className="container">
        <div className="search-box py-sm-5 py-md-7 py-lg-5 row">
          <div className="col-lg-3" />
          <div className="col-lg-6 search-box-inner d-flex flex-column align-items-center mb-2 mb-sm-5 mb-md-4">
            <h1>Explore OpenCourseWare</h1>
            <div>
              <span className="align-item-center search-box-description">
                Search for courses, materials & teaching resources
              </span>
            </div>
            <div className="w-100 d-flex flex-column align-items-center search-input-wrapper mt-5">
              <div className="w-100">
                <SearchBox
                  value={text}
                  onChange={updateText}
                  onSubmit={onSubmit}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-3" />
        </div>
        <div className="row">
          <SearchFilterDrawer
            facetMap={facetMap}
            facetOptions={facetOptions}
            activeFacets={activeFacets}
            onUpdateFacets={
              (onUpdateFacets as any) as React.ChangeEventHandler<
                HTMLInputElement
              >
            }
            clearAllFilters={clearAllFilters}
            toggleFacet={toggleFacet}
          />
          <div className="search-results-area col-12 col-lg-8 pb-2 pt-2">
            <div
              className={`search-toggle ${
                isResourceSearch ? "nofacet" : "facet"
              }`}
            >
              {!emptyOrNil(suggestions) ? (
                <div className="row suggestions">
                  Did you mean
                  {suggestions.map((suggestion, i) => (
                    <span className="pl-1" key={i}>
                      <a
                        className="suggestion"
                        onClick={e => {
                          e.preventDefault()
                          acceptSuggestion(suggestion)
                          setSuggestions([])
                        }}
                        onKeyPress={e => {
                          if (e.key === "Enter") {
                            acceptSuggestion(suggestion)
                            setSuggestions([])
                          }
                        }}
                        tabIndex={0}
                      >
                        {` ${suggestion}`}
                      </a>
                      {i < suggestions.length - 1 ? " | " : ""}
                    </span>
                  ))}
                  ?
                </div>
              ) : null}
              <ul className="nav pl-2 pb-2 d-flex flex-direction-row mb-1">
                <li className="nav-item flex-grow-0">
                  <button
                    className={`nav-link search-nav ${
                      isResourceSearch ? "" : "active"
                    }`}
                    onClick={toggleResourceSearch(false)}
                  >
                    Courses
                  </button>
                </li>
                <li className="nav-item flex-grow-0">
                  <button
                    className={`nav-link search-nav ${
                      isResourceSearch ? "active" : ""
                    }`}
                    onClick={toggleResourceSearch(true)}
                  >
                    Resources
                  </button>
                </li>
                <li
                  aria-live="polite"
                  aria-atomic="true"
                  className="nav-item flex-grow-1 d-flex align-items-center justify-content-end results-total"
                >
                  {completedInitialLoad ? (
                    <span>
                      <span className="results-total-number">{total}</span>{" "}
                      results
                    </span>
                  ) : null}
                </li>
                {!isResourceSearch ? (
                  <li className="sort-nav-item nav-item d-flex align-items-center justify-content-end">
                    Sort by{" "}
                    <select
                      value={serializeSort(sort)}
                      onChange={updateSort}
                      className="ml-2 sort-dropdown"
                    >
                      <option value="">Relevance</option>
                      <option value={COURSENUM_SORT_FIELD}>
                        MIT course nr
                      </option>
                      <option value="-runs.best_start_date">Date</option>
                    </select>
                  </li>
                ) : null}
              </ul>
            </div>
            <InfiniteScroll
              hasMore={from + SEARCH_PAGE_SIZE < total}
              loadMore={loadMore}
              initialLoad={false}
              loader={
                completedInitialLoad ? <Spinner key="spinner" /> : undefined
              }
            >
              <section
                role="feed"
                aria-busy={requestInFlight}
                aria-label="OpenCourseWare Search Results"
              >
                {completedInitialLoad ? (
                  results.length === 0 ? (
                    <div className="no-results-found">
                      <span>No results found for your query</span>
                    </div>
                  ) : (
                    results.map((hit, idx) => (
                      <SearchResult
                        key={`${hit._source.title}_${idx}`}
                        id={`search-result-${idx}`}
                        index={idx}
                        object={searchResultToLearningResource(hit._source)}
                      />
                    ))
                  )
                ) : (
                  <Loading />
                )}
              </section>
            </InfiniteScroll>
          </div>
          <div className="search-results-area col-12 col-lg-1" />
        </div>
      </div>
    </div>
  )
}
