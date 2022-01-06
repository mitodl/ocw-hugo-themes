// @ts-nocheck
import React from "react"
import { mount, ReactWrapper } from "enzyme"
import { act } from "react-dom/test-utils"
import { search } from "../lib/api"
import { times } from "ramda"
import { INITIAL_FACET_STATE } from "@mitodl/course-search-utils/dist/constants"
import { serializeSearchParams } from "@mitodl/course-search-utils/dist/url_utils"
import {
  LR_TYPE_COURSE,
  LR_TYPE_RESOURCEFILE
} from "@mitodl/course-search-utils/dist/constants"
import FilterableFacet from "./FilterableFacet"

import SearchPage, { SEARCH_PAGE_SIZE } from "./SearchPage"

import { makeCourseResult } from "../factories/search"

const mockGetResults = () =>
  times(makeCourseResult, SEARCH_PAGE_SIZE).map(result => ({ _source: result }))

let resolver

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

jest.mock("lodash.debounce", () => jest.fn(fn => fn))

const defaultCourseFacets = {
  ...INITIAL_FACET_STATE,
  type: [LR_TYPE_COURSE]
}

const defaultResourceFacets = {
  ...INITIAL_FACET_STATE,
  type: [LR_TYPE_RESOURCEFILE]
}

describe("SearchPage component", () => {
  const render = async (searchParam = ""): Promise<ReactWrapper> => {
    window.location.search = searchParam
    let wrapper
    // @ts-ignore
    await act(async () => {
      wrapper = mount(<SearchPage />)
    })
    // @ts-ignore
    return wrapper
  }

  beforeEach(() => {
    delete window.location

    window.location = {
      search: ""
    }
  })

  //
  ;[
    { text: "", activeFacets: {} },
    { text: "amazing text!", activeFacets: {} },
    {
      text:         "great search",
      activeFacets: { topics: ["mathematics"] }
    },
    {
      text:         "",
      activeFacets: { topics: ["science"] }
    }
  ].forEach(params => {
    test(`should search at startup with ${serializeSearchParams(
      params
    )}`, async () => {
      const searchString = serializeSearchParams(params)
      await render(searchString)

      expect(search.mock.calls[0]).toEqual([
        {
          text:         params.text,
          from:         0,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: {
            ...defaultCourseFacets,
            ...params.activeFacets
          },
          sort: null
        }
      ])
    })
  })

  test("the user can update the search text and submit", async () => {
    const wrapper = await render()
    wrapper
      .find("input")
      .at(0)
      .simulate("change", { target: { value: "New Search Text" } })
    await act(async () => {
      wrapper.find("SearchBox").prop("onSubmit")({ preventDefault: jest.fn() })
      resolver()
    })
    expect(search.mock.calls).toEqual([
      [
        {
          text:         "",
          from:         0,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort:         null
        }
      ],
      [
        {
          text:         "New Search Text",
          from:         0,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort:         null
        }
      ]
    ])
    wrapper.update()
    expect(wrapper.find("SearchResult").length).toBe(SEARCH_PAGE_SIZE)
  })

  test("the user can switch to resource search", async () => {
    const parameters = {
      text:         "Math 101",
      activeFacets: {
        topics:              ["mathematics"],
        course_feature_tags: ["Exams", "Problem Sets with Solutions"]
      }
    }
    const searchString = serializeSearchParams(parameters)
    const wrapper = await render(searchString)
    await act(async () => {
      wrapper
        .find(".search-nav")
        .at(1)
        .simulate("click")
      resolver()
    })
    expect(search.mock.calls).toEqual([
      [
        {
          text:         parameters.text,
          from:         0,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: { ...defaultCourseFacets, ...parameters.activeFacets },
          sort:         null
        }
      ],
      [
        {
          text:         parameters.text,
          from:         0,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: defaultResourceFacets,
          sort:         null
        }
      ]
    ])
    wrapper.update()
    expect(wrapper.find("SearchResult").length).toBe(SEARCH_PAGE_SIZE)
  })

  test("should show suggestions if present on the search result", async () => {
    const parameters = {
      text: "Mothemotocs"
    }
    const searchString = serializeSearchParams(parameters)
    const wrapper = await render(searchString)
    await resolveSearch({
      suggest: ["mathematics"]
    })
    wrapper.update()
    expect(wrapper.find(".suggestions").text()).toEqual(
      "Did you mean mathematics?"
    )
    wrapper.find(".suggestion").simulate("click")
    wrapper.update()
    expect(wrapper.find("SearchBox").prop("value")).toEqual("mathematics")
    expect(!wrapper.find(".suggestion").exists())
  })

  test("should not show suggestion if it is the same as query minus quotes, case", async () => {
    const parameters = {
      text: ' "Mathematics: Basic Principles!" '
    }
    const searchString = serializeSearchParams(parameters)
    const wrapper = await render(searchString)
    await resolveSearch({
      suggest: ["mathematics basic principles"]
    })
    wrapper.update()
    expect(!wrapper.find(".suggestions").exists())
  })

  it("should allow the user to toggle sort", async () => {
    const sortParam = "-sortablefieldname",
      differentSortParam = "differentsortparam"
    const parameters = {
      sort: { field: sortParam, option: "asc" }
    }
    const searchString = serializeSearchParams(parameters)
    const wrapper = await render(searchString)
    const select = wrapper.find(".sort-nav-item select")
    expect(select.prop("value")).toBe(sortParam)
    act(() => {
      select.prop("onChange")({ target: { value: differentSortParam } })
    })
    expect(search.mock.calls[1][0].sort).toEqual({
      field:  differentSortParam,
      option: "asc"
    })
  })

  it("should display the number of results", async () => {
    const wrapper = await render()
    await resolveSearch()
    const resultsText = wrapper.find(".results-total").text()
    expect(resultsText).toBe("10 Results")
  })

  //
  ;[
    [LR_TYPE_COURSE, true],
    [LR_TYPE_RESOURCEFILE, false]
  ].forEach(([type, sortExists]) => {
    it(`${
      sortExists ? "should" : "shouldn't"
    } show the sort option if the user is on the ${type} page`, async () => {
      const parameters = {
        activeFacets: {
          type: [type]
        }
      }
      const searchString = serializeSearchParams(parameters)
      const wrapper = await render(searchString)
      expect(wrapper.find(".sort-nav-item").exists()).toBe(sortExists)
    })
  })

  it("should show spinner when searching", async () => {
    const wrapper = await render()
    await resolveSearch()
    wrapper
      .find("input")
      .at(0)
      .simulate("change", { target: { value: "New Search Text" } })
    await act(async () => {
      wrapper.find("SearchBox").prop("onSubmit")({ preventDefault: jest.fn() })
    })
    wrapper.update()
    expect(wrapper.find("Loading").exists()).toBeTruthy()
  })

  test("should support InfiniteScroll-ing", async () => {
    const wrapper = await render()
    await resolveSearch()
    wrapper.update()
    await act(async () => {
      wrapper.find("InfiniteScroll").prop("loadMore")()
    })
    await resolveSearch()
    wrapper.update()
    await act(async () => {
      wrapper.find("InfiniteScroll").prop("loadMore")()
    })
    await resolveSearch()
    wrapper.update()
    expect(search.mock.calls).toEqual([
      [
        {
          text:         "",
          from:         0,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort:         null
        }
      ],
      [
        {
          text:         "",
          from:         SEARCH_PAGE_SIZE,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort:         null
        }
      ],
      [
        {
          text:         "",
          from:         2 * SEARCH_PAGE_SIZE,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort:         null
        }
      ]
    ])
    expect(wrapper.find("SearchResult").length).toBe(3 * SEARCH_PAGE_SIZE)
  })

  test("InfiniteScroll should only trigger one search request at a time", async () => {
    const wrapper = await render()
    await resolveSearch()
    wrapper.update()
    await act(async () => {
      wrapper.find("InfiniteScroll").prop("loadMore")()
    })
    wrapper.update()
    // first request is still in-flight now because we haven't called resolveSearch yet
    // so loaded prop passed to useCourseSearch will be false (and therefore this second
    // call to the `loadMore` function should be a no-op).
    await act(async () => {
      wrapper.find("InfiniteScroll").prop("loadMore")()
    })
    await resolveSearch()
    wrapper.update()
    expect(search.mock.calls).toEqual([
      [
        {
          text:         "",
          from:         0,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort:         null
        }
      ],
      [
        {
          text:         "",
          from:         SEARCH_PAGE_SIZE,
          size:         SEARCH_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort:         null
        }
      ]
    ])
    expect(wrapper.find("SearchResult").length).toBe(2 * SEARCH_PAGE_SIZE)
  })

  test("should show spinner during initial load", async () => {
    const wrapper = await render()
    expect(wrapper.find("Loading").exists()).toBeTruthy()
    await resolveSearch()
    wrapper.update()
    expect(wrapper.find("Loading").exists()).toBeFalsy()
  })

  test("should render a FilterableFacet for topic, course features, department", async () => {
    const wrapper = await render()
    await resolveSearch()
    wrapper.update()
    const [topic, features, department] = Array.from(
      wrapper.find("FilterableSearchFacet")
    )
    expect(topic.props.name).toEqual("topics")
    expect(topic.props.title).toEqual("Topics")
    expect(topic.props.currentlySelected).toEqual([])
    expect(features.props.name).toEqual("course_feature_tags")
    expect(features.props.title).toEqual("Features")
    expect(features.props.currentlySelected).toEqual([])
    expect(department.props.name).toEqual("department_name")
    expect(department.props.title).toEqual("Departments")
    expect(department.props.currentlySelected).toEqual([])
  })
})
