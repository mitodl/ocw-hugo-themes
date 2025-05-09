import { useState, useCallback } from "react"
import InfiniteScroll from "react-infinite-scroller"
import {
  Aggregations,
  useCourseSearch,
  serializeSort,
  LearningResourceType,
  Facets
} from "@mitodl/course-search-utils"
import { without } from "ramda"
import { History as RouterHistory } from "history"

import SearchResult from "./SearchResult"
import SearchBox from "./SearchBox"
import SearchFilterDrawer from "./SearchFilterDrawer"
import Loading, { Spinner } from "./Loading"

import { search } from "../lib/api"
import { searchResultToLearningResource } from "../lib/search"
import {
  COURSENUM_SORT_FIELD,
  CONTACT_URL,
  SEARCH_COMPACT_UI,
  DEFAULT_UI_PAGE_SIZE,
  COMPACT_UI_PAGE_SIZE,
  OCW_PLATFORM
} from "../lib/constants"
import { emptyOrNil, isDoubleQuoted } from "../lib/util"
import { FacetManifest, LearningResourceResult } from "../LearningResources"

const COURSE_FACETS: FacetManifest = [
  ["department_name", "Departments", true, true],
  ["level", "Level", false, false],
  ["topics", "Topics", true, false],
  ["course_feature_tags", "Features", true, false]
]

const RESOURCE_FACETS: FacetManifest = [
  ["resource_type", "Resource Types", true, false],
  ["topics", "Topics", true, false]
]

interface Result {
  _source: LearningResourceResult
}

type SearchPageProps = {
  history: RouterHistory
}

export default function SearchPage(props: SearchPageProps) {
  const { history } = props
  const [results, setSearchResults] = useState<Result[]>([])
  const [aggregations, setAggregations] = useState<Aggregations>(new Map())
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [completedInitialLoad, setCompletedInitialLoad] = useState(false)
  const [searchApiFailed, setSearchApiFailed] = useState(false)
  const [requestInFlight, setRequestInFlight] = useState(false)

  const isResourceSearch = (activeFacets: Facets) => {
    return activeFacets.type?.includes(LearningResourceType.ResourceFile)
  }

  const runSearch = useCallback(
    async (
      text: string,
      activeFacets: Facets,
      from: number,
      sort: any, // eslint-disable-line @typescript-eslint/no-explicit-any
      ui: any // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => {
      activeFacets["offered_by"] = [OCW_PLATFORM]
      if (activeFacets?.type && activeFacets.type.length > 1) {
        // Default is LR_TYPE_ALL, don't want that here. course or resourcefile only
        activeFacets["type"] = [LearningResourceType.Course]
      }
      const pageSize = getPageSizeFromUIParam(ui)

      const relevantFacets = isResourceSearch(activeFacets) ?
        RESOURCE_FACETS :
        COURSE_FACETS
      const allowedAggregations = relevantFacets.map(facet => facet[0])

      setRequestInFlight(true)
      const newResults = await search({
        text,
        from,
        activeFacets,
        size:         pageSize,
        sort:         sort,
        aggregations: allowedAggregations
      })
      setRequestInFlight(false)

      if (newResults["apiFailed"]) {
        setSearchApiFailed(true)
        return
      }

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
        from === 0 ?
          newResults.hits.hits :
          [...results, ...newResults.hits.hits]
      )
      setTotal(newResults.hits.total)
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
    ui
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
    (nextResourceFilterState: boolean) => async () => {
      if (isResourceSearch(activeFacets) === nextResourceFilterState) {
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
        // @ts-expect-error We should clean this up. It works because Map constructor is ignoring everything except 0th, 1st item in the entries array.
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

  const facetMap = isResourceSearch(activeFacets) ?
    RESOURCE_FACETS :
    COURSE_FACETS
  const pageSize = getPageSizeFromUIParam(ui)
  return (
    <div className="search-page w-100">
      <div className="container px-lg-0">
        <div className="search-box py-sm-5 py-md-7 py-lg-5 row">
          <div className="col-lg-3" />
          <div className="col-lg-6 search-box-inner d-flex flex-column align-items-center mb-2 mb-sm-5 mb-md-4 ml-lg-3">
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
        <div className="row search-filter-drawer mx-auto px-lg-6">
          <SearchFilterDrawer
            facetMap={facetMap}
            facetOptions={facetOptions}
            activeFacets={activeFacets}
            onUpdateFacets={onUpdateFacets}
            clearAllFilters={clearAllFilters}
            toggleFacet={toggleFacet}
            updateUI={updateUI}
          />
          <div className="search-results-area col-12 col-lg-9 pb-2 pt-2 pr-lg-0">
            <div
              className={`search-toggle ${
                isResourceSearch(activeFacets) ? "nofacet" : "facet"
              }`}
            >
              {!emptyOrNil(suggestions) ? (
                <div className="row suggestions">
                  Did you mean
                  {suggestions.map((suggestion, i) => (
                    <span className="pl-1" key={i}>
                      <a
                        /**
                         * NOTE: Because this anchor tag does not have an href,
                         * we explicitly add role="link", tabindex, and handle
                         * keypress events to make it keyboard accessible.
                         */
                        role="link"
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
                      isResourceSearch(activeFacets) ? "" : "active"
                    }`}
                    type="button"
                    onClick={toggleResourceSearch(false)}
                  >
                    Courses
                  </button>
                </li>
                <li className="nav-item flex-grow-0">
                  <button
                    className={`nav-link search-nav ${
                      isResourceSearch(activeFacets) ? "active" : ""
                    }`}
                    type="button"
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
                {!isResourceSearch(activeFacets) ? (
                  <li className="sort-nav-item nav-item d-flex align-items-center justify-content-end">
                    <label className="mb-0" htmlFor="sort-dropdown">
                      Sort by
                    </label>
                    <select
                      id="sort-dropdown"
                      value={serializeSort(sort)}
                      onChange={updateSort}
                      className="ml-2 sort-dropdown"
                    >
                      <option value="">Relevance</option>
                      <option value={COURSENUM_SORT_FIELD}>MIT course #</option>
                      <option value="-runs.best_start_date">Date</option>
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
            {/* @ts-expect-error: react-infinite-scroller types are outdated for React 18; runtime is correct */}
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
                        key={`${hit._source.title}_${idx}`}
                        id={`search-result-${idx}`}
                        index={idx}
                        object={searchResultToLearningResource(hit._source)}
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
