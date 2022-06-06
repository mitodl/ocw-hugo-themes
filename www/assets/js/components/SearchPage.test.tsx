import React from "react"
import { mount, ReactWrapper } from "enzyme"
import { act } from "react-dom/test-utils"
import { search } from "../lib/api"
import { times } from "ramda"
import {
  INITIAL_FACET_STATE,
  LearningResourceType,
  serializeSearchParams
} from "@mitodl/course-search-utils"

import SearchPage from "./SearchPage"

import { LIST_UI_PAGE_SIZE, COMPACT_UI_PAGE_SIZE } from "../lib/constants"

import { makeCourseResult } from "../factories/search"

const mockGetResults = () =>
  times(makeCourseResult, LIST_UI_PAGE_SIZE).map(result => ({
    _source: result
  }))

// @ts-ignore
let resolver

const resolveSearch = (extraData = {}) =>
  act(async () => {
    // @ts-ignore
    resolver(extraData)
  })

jest.mock("../lib/api", () => ({
  __esModule: true,
  search: jest.fn(async () => {
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
  type: [LearningResourceType.Course]
}

const defaultResourceFacets = {
  ...INITIAL_FACET_STATE,
  type: [LearningResourceType.ResourceFile]
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
    // @ts-ignore
    delete window.location

    // @ts-ignore
    window.location = {
      search: ""
    }
  })

  //
  ;[
    { text: "", activeFacets: {} },
    { text: "amazing text!", activeFacets: {} },
    {
      text: "great search",
      activeFacets: { topics: ["Mathematics"] }
    },
    {
      text: "",
      activeFacets: { topics: ["Science"] }
    }
  ].forEach(params => {
    test(`should search at startup with ${serializeSearchParams(
      params
    )}`, async () => {
      const searchString = serializeSearchParams(params)
      await render(searchString)

      // @ts-ignore
      expect(search.mock.calls[0]).toEqual([
        {
          text: params.text,
          from: 0,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: {
            ...defaultCourseFacets,
            ...params.activeFacets
          },
          sort: null,
          ui: null
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
      // @ts-ignore
      wrapper.find("SearchBox").prop("onSubmit")({ preventDefault: jest.fn() })
      // @ts-ignore
      resolver()
    })
    // @ts-ignore
    expect(search.mock.calls).toEqual([
      [
        {
          text: "",
          from: 0,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort: null,
          ui: null
        }
      ],
      [
        {
          text: "New Search Text",
          from: 0,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort: null,
          ui: null
        }
      ]
    ])
    wrapper.update()
    expect(wrapper.find("SearchResult").length).toBe(LIST_UI_PAGE_SIZE)
  })

  test("the user can switch to resource search", async () => {
    const parameters = {
      text: "Math 101",
      activeFacets: {
        topics: ["Mathematics"],
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
      // @ts-ignore
      resolver()
    })
    // @ts-ignore
    expect(search.mock.calls).toEqual([
      [
        {
          text: parameters.text,
          from: 0,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: { ...defaultCourseFacets, ...parameters.activeFacets },
          sort: null,
          ui: null
        }
      ],
      [
        {
          text: parameters.text,
          from: 0,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: {
            ...defaultResourceFacets,
            ...{ topics: ["Mathematics"] }
          },
          sort: null,
          ui: null
        }
      ]
    ])
    wrapper.update()
    expect(wrapper.find("SearchResult").length).toBe(LIST_UI_PAGE_SIZE)
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
      // @ts-ignore
      select.prop("onChange")!({ target: { value: differentSortParam } })
    })
    // @ts-ignore
    expect(search.mock.calls[1][0].sort).toEqual({
      field: differentSortParam,
      option: "asc"
    })
  })

  it("should allow the user to toggle the layout", async () => {
    const wrapper = await render(serializeSearchParams({}))

    act(() => {
      // @ts-ignore
      wrapper
        .find(".layout-button-right")
        .at(0)
        .simulate("click")
    })
    // @ts-ignore

    expect(search.mock.calls[1][0].ui).toEqual("compact")
  })

  it("should display the number of results", async () => {
    const wrapper = await render()
    await resolveSearch()
    const results = wrapper.find(".results-total")
    expect(results.text()).toBe("10 results")
    expect(results.prop("aria-live")).toBe("polite")
    expect(results.prop("aria-atomic")).toBe("true")
  })

  //
  ;[
    [LearningResourceType.Course, true],
    [LearningResourceType.ResourceFile, false]
  ].forEach(([type, sortExists]) => {
    it(`${
      sortExists ? "should" : "shouldn't"
    } show the sort option if the user is on the ${type} page`, async () => {
      const parameters = {
        activeFacets: {
          type: [type]
        }
      }
      // @ts-ignore
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
      wrapper.find("SearchBox").prop("onSubmit")!(({
        preventDefault: jest.fn()
      } as any) as React.FormEvent<{}>)
    })
    wrapper.update()
    expect(wrapper.find("Loading").exists()).toBeTruthy()
  })

  test("should support InfiniteScroll-ing", async () => {
    const wrapper = await render()
    await resolveSearch()
    wrapper.update()
    await act(async () => {
      // @ts-ignore
      wrapper.find("InfiniteScroll").prop("loadMore")()
    })
    await resolveSearch()
    wrapper.update()
    await act(async () => {
      // @ts-ignore
      wrapper.find("InfiniteScroll").prop("loadMore")()
    })
    await resolveSearch()
    wrapper.update()
    // @ts-ignore
    expect(search.mock.calls).toEqual([
      [
        {
          text: "",
          from: 0,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort: null,
          ui: null
        }
      ],
      [
        {
          text: "",
          from: LIST_UI_PAGE_SIZE,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort: null,
          ui: null
        }
      ],
      [
        {
          text: "",
          from: 2 * LIST_UI_PAGE_SIZE,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort: null,
          ui: null
        }
      ]
    ])
    expect(wrapper.find("SearchResult").length).toBe(3 * LIST_UI_PAGE_SIZE)
  })

  test("InfiniteScroll should only trigger one search request at a time", async () => {
    const wrapper = await render()
    await resolveSearch()
    wrapper.update()
    await act(async () => {
      // @ts-ignore
      wrapper.find("InfiniteScroll").prop("loadMore")()
    })
    wrapper.update()
    // first request is still in-flight now because we haven't called resolveSearch yet
    // so loaded prop passed to useCourseSearch will be false (and therefore this second
    // call to the `loadMore` function should be a no-op).
    await act(async () => {
      // @ts-ignore
      wrapper.find("InfiniteScroll").prop("loadMore")()
    })
    await resolveSearch()
    wrapper.update()
    // @ts-ignore
    expect(search.mock.calls).toEqual([
      [
        {
          text: "",
          from: 0,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort: null,
          ui: null
        }
      ],
      [
        {
          text: "",
          from: LIST_UI_PAGE_SIZE,
          size: LIST_UI_PAGE_SIZE,
          activeFacets: defaultCourseFacets,
          sort: null,
          ui: null
        }
      ]
    ])
    expect(wrapper.find("SearchResult").length).toBe(2 * LIST_UI_PAGE_SIZE)
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
      // @ts-ignore
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
