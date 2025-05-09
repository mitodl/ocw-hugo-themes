import { render, screen, within } from "@testing-library/react"
import user from "@testing-library/user-event"
import { act } from "react"
import { search } from "../lib/api"
import { times } from "ramda"
import {
  INITIAL_FACET_STATE,
  LearningResourceType,
  serializeSearchParams
} from "@mitodl/course-search-utils"

import SearchPage from "./SearchPage"

import { DEFAULT_UI_PAGE_SIZE, COMPACT_UI_PAGE_SIZE } from "../lib/constants"

import { makeCourseResult } from "../factories/search"
import { createMemoryHistory, InitialEntry } from "history"

const mockGetResults = () =>
  times(() => makeCourseResult(), DEFAULT_UI_PAGE_SIZE).map(result => ({
    _source: result
  }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let resolver = (_extraData?: any) => {
  // pass
}

const resolveSearch = (extraData = {}) =>
  act(async () => {
    resolver(extraData)
  })

jest.mock("../lib/api", () => ({
  __esModule: true,
  search:     jest.fn(async () => {
    return new Promise(resolve => {
      resolver = (extraData = {}) => {
        const results = mockGetResults()
        resolve({
          hits: { hits: results, total: results.length },
          ...extraData
        })
      }
    })
  })
}))
const spySearch = jest.mocked(search)

const defaultCourseFacets = {
  ...INITIAL_FACET_STATE,
  type:       [LearningResourceType.Course],
  offered_by: ["OCW"]
}

const defaultResourceFacets = {
  ...INITIAL_FACET_STATE,
  type:       [LearningResourceType.ResourceFile],
  offered_by: ["OCW"]
}

describe("SearchPage component", () => {
  const renderComponent = (searchParam = "") => {
    const initialEntry: InitialEntry = { search: searchParam }
    const history = createMemoryHistory({ initialEntries: [initialEntry] })
    const result = render(<SearchPage history={history} />)
    return { ...result, history }
  }

  //
  ;[
    { text: "", activeFacets: {} },
    { text: "amazing text!", activeFacets: {} },
    {
      text:         "great search",
      activeFacets: { topics: ["Mathematics"] }
    },
    {
      text:         "",
      activeFacets: { topics: ["Science"] }
    }
  ].forEach(params => {
    test(`should search at startup with ${serializeSearchParams(
      params
    )}`, async () => {
      const searchString = serializeSearchParams(params)
      renderComponent(searchString)

      expect(spySearch.mock.calls[0]).toEqual([
        {
          text:         params.text,
          from:         0,
          size:         DEFAULT_UI_PAGE_SIZE,
          activeFacets: {
            ...defaultCourseFacets,
            ...params.activeFacets
          },
          aggregations: [
            "department_name",
            "level",
            "topics",
            "course_feature_tags"
          ],
          sort: null
        }
      ])
    })
  })

  test("the user can update the search text and submit", async () => {
    renderComponent()
    await resolveSearch()

    const searchInput = screen.getByRole("searchbox")

    await user.type(searchInput, "New Search Text")
    await user.click(screen.getByRole("button", { name: "Search" }))

    await resolveSearch()

    expect(spySearch.mock.calls).toEqual([
      [
        {
          text:         "",
          from:         0,
          size:         DEFAULT_UI_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort:         null,
          aggregations: [
            "department_name",
            "level",
            "topics",
            "course_feature_tags"
          ]
        }
      ],
      [
        {
          text:         "New Search Text",
          from:         0,
          size:         DEFAULT_UI_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort:         null,
          aggregations: [
            "department_name",
            "level",
            "topics",
            "course_feature_tags"
          ]
        }
      ]
    ])

    const searchResults = screen.getAllByRole("article")
    expect(searchResults.length).toBe(DEFAULT_UI_PAGE_SIZE)
  })

  test("the user can switch to resource search", async () => {
    const parameters = {
      text:         "Math 101",
      activeFacets: {
        topics:              ["Mathematics"],
        course_feature_tags: ["Exams", "Problem Sets with Solutions"]
      }
    }
    const searchString = serializeSearchParams(parameters)
    renderComponent(searchString)
    await resolveSearch()

    await user.click(screen.getByRole("button", { name: "Resources" }))

    await resolveSearch()

    expect(spySearch.mock.calls).toEqual([
      [
        {
          text:         parameters.text,
          from:         0,
          size:         DEFAULT_UI_PAGE_SIZE,
          activeFacets: { ...defaultCourseFacets, ...parameters.activeFacets },
          sort:         null,
          aggregations: [
            "department_name",
            "level",
            "topics",
            "course_feature_tags"
          ]
        }
      ],
      [
        {
          text:         parameters.text,
          from:         0,
          size:         DEFAULT_UI_PAGE_SIZE,
          activeFacets: {
            ...defaultResourceFacets,
            ...{ topics: ["Mathematics"] }
          },
          sort:         null,
          aggregations: ["resource_type", "topics"]
        }
      ]
    ])

    const searchResults = screen.getAllByRole("article")
    expect(searchResults.length).toBe(DEFAULT_UI_PAGE_SIZE)
  })

  test("should show suggestions if present on the search result", async () => {
    const parameters = {
      text: "Mothemotocs"
    }
    const searchString = serializeSearchParams(parameters)
    renderComponent(searchString)
    await resolveSearch({
      suggest: ["mathematics"]
    })

    const suggestionContainer = screen.getByText(/Did you mean/)
    expect(suggestionContainer).toBeInTheDocument()

    await user.click(screen.getByRole("link", { name: "mathematics" }))

    expect(screen.getByRole("searchbox")).toHaveValue("mathematics")
    expect(
      screen.queryByText(content => content.includes("Did you mean"))
    ).not.toBeInTheDocument()
  })

  test("should not show suggestion if it is the same as query minus quotes, case", async () => {
    const parameters = {
      text: ' "Mathematics: Basic Principles!" '
    }
    const searchString = serializeSearchParams(parameters)
    renderComponent(searchString)
    await resolveSearch({
      suggest: ["mathematics basic principles"]
    })

    expect(
      screen.queryByText(content => content.includes("Did you mean"))
    ).not.toBeInTheDocument()
  })

  it("should allow the user to toggle sort", async () => {
    const sortParam = "-sortablefieldname"
    const parameters = {
      sort: { field: sortParam, option: "asc" }
    }
    const searchString = serializeSearchParams(parameters)
    renderComponent(searchString)
    await resolveSearch()

    const sortSelect = screen.getByRole("combobox")

    const sortOptions = Array.from(sortSelect.querySelectorAll("option")).map(
      opt => opt.value
    )
    await user.selectOptions(sortSelect, sortOptions[1])

    expect(spySearch).toHaveBeenCalledTimes(2)
    expect(spySearch.mock.calls[1][0].text).toBe("")
  })

  it("should allow the user to toggle the layout", async () => {
    renderComponent(serializeSearchParams({}))
    await resolveSearch()

    const compactViewButton = screen.getByRole("button", {
      name: "show compact results"
    })
    await user.click(compactViewButton)

    expect(spySearch.mock.calls[0][0].size).toEqual(DEFAULT_UI_PAGE_SIZE)
    expect(spySearch.mock.calls[1][0].size).toEqual(COMPACT_UI_PAGE_SIZE)
  })

  it("should display the number of results", async () => {
    renderComponent()
    await resolveSearch()

    const resultsElement = screen.getByText(/results$/i)
    expect(resultsElement).toBeInTheDocument()

    const resultsContainer = screen
      .getByText(/results$/i)
      .closest(".results-total")
    expect(resultsContainer).toHaveAttribute("aria-live", "polite")
    expect(resultsContainer).toHaveAttribute("aria-atomic", "true")
  })

  //
  ;(
    [
      [LearningResourceType.Course, true],
      [LearningResourceType.ResourceFile, false]
    ] as const
  ).forEach(([type, sortExists]) => {
    it(`${
      sortExists ? "should" : "shouldn't"
    } show the sort option if the user is on the ${type} page`, async () => {
      const parameters = {
        activeFacets: {
          type: [type]
        }
      }
      const searchString = serializeSearchParams(parameters)
      renderComponent(searchString)
      await resolveSearch()

      const sortByText = screen.queryByText("Sort by")
      expect(!!sortByText).toBe(sortExists)
    })
  })

  it("should show spinner when searching", async () => {
    renderComponent()
    await resolveSearch()

    const searchInput = screen.getByRole("searchbox")
    await user.type(searchInput, "New Search Text")

    await user.click(screen.getByRole("button", { name: "Search" }))

    const feedContainer = screen.getByRole("feed")
    expect(feedContainer).toHaveAttribute("aria-busy", "true")
  })

  test("should support InfiniteScroll-ing", async () => {
    renderComponent()
    await resolveSearch()

    const feed = screen.getByRole("feed")
    const searchResults = within(feed).getAllByRole("article")
    expect(searchResults.length).toBe(DEFAULT_UI_PAGE_SIZE)
  })

  test("should show spinner during initial load", async () => {
    renderComponent()

    await resolveSearch()

    const feedContainer = screen.getByRole("feed")
    expect(feedContainer).toHaveAttribute("aria-busy", "false")

    const searchResults = screen.getAllByRole("article")
    expect(searchResults.length).toBe(DEFAULT_UI_PAGE_SIZE)
  })

  test("should render filterable facets", async () => {
    renderComponent()
    await resolveSearch()

    expect(screen.getByText("Filters")).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: "Clear All" })
    ).toBeInTheDocument()

    const filterSection = screen
      .getByText("Filters")
      .closest(".active-search-filters")
    expect(filterSection).toBeInTheDocument()
  })
})
