import React, { useState, useCallback } from "react"
import InfiniteScroll from "react-infinite-scroller"
import { useCourseSearch } from "@mitodl/course-search-utils"
import {
  LR_TYPE_COURSE,
  LR_TYPE_RESOURCEFILE
} from "@mitodl/course-search-utils/dist/constants"
import { without } from "ramda"

import SearchResult from "./SearchResult"
import SearchBox from "./SearchBox"
import SearchFilterDrawer from "./SearchFilterDrawer"
import Loading, { Spinner } from "./Loading"

import { search } from "../lib/api"
import { searchResultToLearningResource, SEARCH_LIST_UI } from "../lib/search"
import { emptyOrNil, isDoubleQuoted } from "../lib/util"

export const SEARCH_PAGE_SIZE = 10

const COURSE_FACETS = [
  ["level", "Level", false],
  ["topics", "Topics", true],
  ["course_feature_tags", "Features", true],
  ["department_name", "Departments", true]
]

const RESOURCE_FACETS = [["resource_type", "Resource Types", true]]

export default function SearchPage() {
  const [results, setSearchResults] = useState([])
  const [facets, setSearchFacets] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [total, setTotal] = useState(0)
  const [completedInitialLoad, setCompletedInitialLoad] = useState(false)
  const [busy, setBusy] = useState(false)

  const runSearch = useCallback(
    async (text, activeFacets, from) => {
      if (activeFacets && activeFacets.type.length > 1) {
        // Default is LR_TYPE_ALL, don't want that here. course or resourcefile only
        activeFacets["type"] = [LR_TYPE_COURSE]
      }

      setBusy(true)
      const newResults = await search({
        text,
        from,
        activeFacets,
        size: SEARCH_PAGE_SIZE
      })
      setBusy(false)

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
        setSuggestions(null)
      }

      setSearchFacets(new Map(Object.entries(newResults.aggregations ?? {})))

      setSearchResults(
        from === 0 ?
          newResults.hits.hits :
          [...results, ...newResults.hits.hits]
      )
      setTotal(newResults.hits.total)
      setCompletedInitialLoad(true)
    },
    [
      setSearchResults,
      results,
      setTotal,
      setCompletedInitialLoad,
      setSuggestions,
      setBusy
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
    loadMore,
    text,
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
    facets,
    completedInitialLoad,
    SEARCH_PAGE_SIZE
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleResourceSearch = useCallback(
    toggleOn => async () => {
      const toggledFacets = [
        ["type", LR_TYPE_RESOURCEFILE, toggleOn],
        ["type", LR_TYPE_COURSE, !toggleOn]
      ]
      // Remove any facets not relevant to the new search type
      const newFacets = new Map(toggleOn ? RESOURCE_FACETS : COURSE_FACETS)
      Object.entries(activeFacets).forEach(([key, list]) => {
        if (!newFacets.has(key) && !emptyOrNil(list)) {
          list.forEach(value => {
            toggledFacets.push([key, value, false])
          })
        }
      })
      toggleFacets(toggledFacets)
    },
    [toggleFacets, activeFacets]
  )

  const isResourceSearch = activeFacets["type"].includes(LR_TYPE_RESOURCEFILE)
  const facetMap = isResourceSearch ? RESOURCE_FACETS : COURSE_FACETS

  return (
    <div className="search-page w-100">
      <div className="container">
        <div className="search-box py-sm-5 py-md-7 py-lg-5 row">
          <div className="col-lg-3" />
          <div className="col-lg-6 search-box-inner d-flex flex-column align-items-center">
            <h1 className="mb-2 mb-sm-5 mb-md-4">Explore OpenCourseWare</h1>
            <div className="w-100 d-flex flex-column align-items-center search-input-wrapper">
              <span className="align-self-start pb-1 pb-sm-3 search-box-description px-2">
                Search for courses, materials & teaching resources
              </span>
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
        <div className="row" role="search" aria-live="polite">
          <SearchFilterDrawer
            facetMap={facetMap}
            facetOptions={facetOptions}
            activeFacets={activeFacets}
            onUpdateFacets={onUpdateFacets}
            clearAllFilters={clearAllFilters}
            toggleFacet={toggleFacet}
          />
          <div className="col-12 col-lg-6 pb-2">
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
                        tabIndex="0"
                      >
                        {` ${suggestion}`}
                      </a>
                      {i < suggestions.length - 1 ? " | " : ""}
                    </span>
                  ))}
                  ?
                </div>
              ) : null}
              <ul className="nav pl-2 pb-2 d-flex flex-direction-row">
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
                <li className="nav-item flex-grow-1 d-flex align-items-center justify-content-center results-total">
                  {completedInitialLoad ? `${total} Results` : null}
                </li>
              </ul>
            </div>
            <InfiniteScroll
              hasMore={from + SEARCH_PAGE_SIZE < total}
              loadMore={loadMore}
              initialLoad={false}
              loader={completedInitialLoad ? <Spinner key="spinner" /> : null}
            >
              <section
                role="feed"
                aria-busy={busy}
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
                        searchResultLayout={SEARCH_LIST_UI}
                      />
                    ))
                  )
                ) : (
                  <Loading />
                )}
              </section>
            </InfiniteScroll>
          </div>
          <div className="col-12 col-lg-3" />
        </div>
      </div>
    </div>
  )
}
