import React, { useState, useCallback } from "react"
import InfiniteScroll from "react-infinite-scroller"
import {
  useCourseSearch,
  LearningResourceType,
  LEARNING_RESOURCE_ENDPOINT,
  CONTENT_FILE_ENDPOINT,
  Aggregations,
  CourseResource,
  ContentFile,
  FacetManifest,
  getDepartmentName,
  getLevelName,
  sanitizeFacets
} from "@mitodl/course-search-utils"

import { without } from "ramda"
import { History as RouterHistory } from "history"

import SearchResult from "./SearchResult"
import SearchBox from "./SearchBox"
import SearchFilterDrawer from "./SearchFilterDrawer"
import Loading, { Spinner } from "./Loading"

import { search } from "../lib/api"
import {
  courseSearchResultToLearningResource,
  resourceSearchResultToLearningResource
} from "../lib/search"
import {
  CONTACT_URL,
  SEARCH_COMPACT_UI,
  DEFAULT_UI_PAGE_SIZE,
  COMPACT_UI_PAGE_SIZE,
  OCW_OFFEROR,
  FACET_OPTIONS
} from "../lib/constants"
import { emptyOrNil, isDoubleQuoted } from "../lib/util"

const COURSE_FACETS: FacetManifest = [
  {
    name:               "department",
    title:              "Departments",
    useFilterableFacet: true,
    expandedOnLoad:     true,
    labelFunction:      getDepartmentName
  },
  {
    name:               "level",
    title:              "Level",
    useFilterableFacet: false,
    expandedOnLoad:     false,
    labelFunction:      getLevelName
  },
  {
    name:               "topic",
    title:              "Topics",
    useFilterableFacet: true,
    expandedOnLoad:     false
  },
  {
    name:               "course_feature",
    title:              "Features",
    useFilterableFacet: true,
    expandedOnLoad:     false
  }
]

const RESOURCE_FACETS: FacetManifest = [
  {
    name:               "content_feature_type",
    title:              "Resource Types",
    useFilterableFacet: true,
    expandedOnLoad:     false
  },
  {
    name:               "topic",
    title:              "Topics",
    useFilterableFacet: true,
    expandedOnLoad:     false
  }
]

type SearchPageProps = {
  history: RouterHistory
}

export default function SearchPage(props: SearchPageProps) {
  const { history } = props
  const [results, setSearchResults] = useState<
    CourseResource[] | ContentFile[]
  >([])
  const [aggregations, setAggregations] = useState<Aggregations>(new Map())
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [completedInitialLoad, setCompletedInitialLoad] = useState(false)
  const [searchApiFailed, setSearchApiFailed] = useState(false)
  const [requestInFlight, setRequestInFlight] = useState(false)

  const runSearch = useCallback(
    async (text, activeFacets, from, sort, ui, endpoint) => {
      sanitizeFacets(activeFacets, FACET_OPTIONS)
      activeFacets["offered_by"] = [OCW_OFFEROR]
      if (activeFacets && activeFacets.type && activeFacets.type.length > 1) {
        // Default is LR_TYPE_ALL, don't want that here. course or resourcefile only
        activeFacets["resource_type"] = [LearningResourceType.Course]
      }
      const pageSize = getPageSizeFromUIParam(ui)

      const relevantFacets =
        endpoint === CONTENT_FILE_ENDPOINT ? RESOURCE_FACETS : COURSE_FACETS
      const allowedAggregations = relevantFacets.map(facet => facet.name)

      setRequestInFlight(true)

      const newResults = await search({
        text,
        from,
        activeFacets,
        size:         pageSize,
        sort:         sort,
        aggregations: allowedAggregations,
        endpoint:     endpoint
      })
      setRequestInFlight(false)

      if (newResults["apiFailed"]) {
        setSearchApiFailed(true)
        return
      }

      const { suggest } = newResults.metadata
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

      setAggregations(
        new Map(Object.entries(newResults.metadata.aggregations ?? {}))
      )

      setSearchResults(results =>
        from === 0 ? newResults.results : [...results, ...newResults.results]
      )
      setTotal(newResults.count)
      setCompletedInitialLoad(true)
    },
    [
      setSearchResults,
      setTotal,
      setCompletedInitialLoad,
      setSuggestions,
      setRequestInFlight,
      setSearchApiFailed
    ]
  )

  const getPageSizeFromUIParam = (ui: string | null) => {
    if (ui === SEARCH_COMPACT_UI) {
      return COMPACT_UI_PAGE_SIZE
    } else {
      return DEFAULT_UI_PAGE_SIZE
    }
  }

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
    acceptSuggestion,
    updateUI,
    ui,
    endpoint,
    updateEndpoint
  } = useCourseSearch(
    runSearch,
    clearSearch,
    aggregations,
    // this is the 'loaded' value, which is what useCourseSearch uses
    // to determine whether to fire off a request or not.
    completedInitialLoad && !requestInFlight,
    getPageSizeFromUIParam,
    history
  )

  const toggleResourceSearch = useCallback(
    nextResourceFilterState => async () => {
      if (endpoint === nextResourceFilterState) {
        // Immediately return in case the user clicks and already active facet.
        // Github issue https://github.com/mitodl/ocw-hugo-themes/issues/105
        return
      }
      const toggledFacets: [string, string, boolean][] = [
        ["resource_type", LearningResourceType.Course, !nextResourceFilterState]
      ]
      const newFacets: string[] =
        nextResourceFilterState === CONTENT_FILE_ENDPOINT ?
          RESOURCE_FACETS.map(facet => facet.name) :
          COURSE_FACETS.map(facet => facet.name)

      Object.entries(activeFacets).forEach(([key, list]) => {
        if (!newFacets.includes(key) && !emptyOrNil(list)) {
          list.forEach((value: string) => {
            toggledFacets.push([key, value, false])
          })
        }
      })

      if (nextResourceFilterState === CONTENT_FILE_ENDPOINT) {
        updateSort(null)
      }
      toggleFacets(toggledFacets)
      updateEndpoint(nextResourceFilterState)
    },
    [toggleFacets, activeFacets, endpoint, updateEndpoint, updateSort]
  )

  const facetMap =
    endpoint === CONTENT_FILE_ENDPOINT ? RESOURCE_FACETS : COURSE_FACETS
  const pageSize = getPageSizeFromUIParam(ui)
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
            onUpdateFacets={onUpdateFacets}
            clearAllFilters={clearAllFilters}
            toggleFacet={toggleFacet}
            updateUI={updateUI}
          />
          <div className="search-results-area col-12 col-lg-9 pb-2 pt-2">
            <div
              className={`search-toggle ${
                endpoint === CONTENT_FILE_ENDPOINT ? "nofacet" : "facet"
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
                      endpoint === CONTENT_FILE_ENDPOINT ? "" : "active"
                    }`}
                    type="button"
                    onClick={toggleResourceSearch(LEARNING_RESOURCE_ENDPOINT)}
                  >
                    Courses
                  </button>
                </li>
                <li className="nav-item flex-grow-0">
                  <button
                    className={`nav-link search-nav ${
                      endpoint === CONTENT_FILE_ENDPOINT ? "active" : ""
                    }`}
                    type="button"
                    onClick={toggleResourceSearch(CONTENT_FILE_ENDPOINT)}
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
                {!(endpoint === CONTENT_FILE_ENDPOINT) ? (
                  <li className="sort-nav-item nav-item d-flex align-items-center justify-content-end">
                    Sort by{" "}
                    <select
                      value={sort || ""}
                      onChange={updateSort}
                      className="ml-2 sort-dropdown"
                    >
                      <option value="">Relevance</option>
                      <option value="mitcoursenumber">MIT course #</option>
                      <option value="-start_date">Date</option>
                    </select>
                  </li>
                ) : null}
                <div className="layout-buttons layout-buttons-desktop">
                  <button
                    onClick={() => updateUI(null)}
                    className="layout-button-left"
                    type="button"
                    aria-label="show detailed results"
                  >
                    <img
                      src="/images/icons/list_ui_icon.png"
                      alt=""
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    onClick={() => updateUI(SEARCH_COMPACT_UI)}
                    className="layout-button-right"
                    type="button"
                    aria-label="show compact results"
                  >
                    <img
                      src="/images/icons/compact_ui_icon.png"
                      alt=""
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </ul>
            </div>
            <InfiniteScroll
              hasMore={from + pageSize < total}
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
                {searchApiFailed ? (
                  <div className="no-results-found">
                    <span>
                      Oops! Something went wrong. Please accept our apologies
                      and feel free to{" "}
                      <a href={CONTACT_URL}>
                        <b>contact us</b>
                      </a>{" "}
                      with the details of what you were trying to do, and what
                      happened.
                    </span>
                  </div>
                ) : completedInitialLoad ? (
                  results.length === 0 ? (
                    <div className="no-results-found">
                      <span>No results found for your query</span>
                    </div>
                  ) : (
                    results.map((hit, idx) => (
                      <SearchResult
                        key={`${hit.title}_${idx}`}
                        id={`search-result-${idx}`}
                        index={idx}
                        object={
                          endpoint === CONTENT_FILE_ENDPOINT ?
                            resourceSearchResultToLearningResource(
                                hit as ContentFile
                            ) :
                            courseSearchResultToLearningResource(
                                hit as CourseResource
                            )
                        }
                        layout={ui}
                      />
                    ))
                  )
                ) : (
                  <Loading />
                )}
              </section>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  )
}
