import React from "react"
import { mount } from "enzyme"
import { serializeSearchParams } from "@mitodl/course-search-utils"

import SearchResult from "./SearchResult"

import {
  makeCourseSearchResult,
  makeContentFileSearchResult
} from "../factories/search"
import { SEARCH_URL } from "../lib/constants"
import {
  getCoverImageUrl,
  courseSearchResultToLearningResource,
  resourceSearchResultToLearningResource
} from "../lib/search"
import { LearningResource } from "../LearningResources"

describe("SearchResult component", () => {
  const render = (object: LearningResource) =>
    mount(<SearchResult id="boop" index={0} object={object} />)

  it("should render the things we expect for a course", () => {
    const object = courseSearchResultToLearningResource(
      makeCourseSearchResult()
    )
    const wrapper = render(object)
    expect(wrapper.find(".course-title").text()).toBe(object.title)
    const { href, className } = wrapper.find(".course-title").find("a").props()
    expect(href).toBe(object.url)
    expect(className).toBe("w-100")
    expect(wrapper.find(".subtitles").first().text()).toContain(
      object.instructors[0]
    )
    expect(wrapper.find(".cover-image").find("img").first().prop("src")).toBe(
      getCoverImageUrl(object)
    )
    expect(wrapper.find("CoverImage").exists()).toBeTruthy()
  })

  it("should render the things we expect for a resource", () => {
    const object = resourceSearchResultToLearningResource(
      makeContentFileSearchResult()
    )
    const wrapper = render(object)
    expect(wrapper.find(".course-title").text()).toBe(object.content_title)
    expect(wrapper.find(".course-title").find("a").prop("href")).toBe(
      object.url
    )
    expect(wrapper.find(".subtitles").first().text()).toBe(object.description)
    expect(wrapper.find("img").first().prop("src")).toBe(
      getCoverImageUrl(object)
    )
    expect(wrapper.find(".topics-list").text()).toContain(
      object.topics[0]["name"]
    )
    expect(wrapper.find("CoverImage").exists()).toBeTruthy()
  })

  it("should not render a course with no url", () => {
    const object = courseSearchResultToLearningResource(
      makeCourseSearchResult()
    )
    object.url = null
    const wrapper = render(object)
    expect(wrapper.find("Card").exists()).toBeFalsy()
  })

  it("should not render a resource with no url", () => {
    const object = resourceSearchResultToLearningResource(
      makeContentFileSearchResult()
    )
    object.url = null
    const wrapper = render(object)
    expect(wrapper.find("Card").exists()).toBeFalsy()
  })

  //
  it(`should not render div for instructors, topics if they are empty`, () => {
    const result = makeCourseSearchResult()
    // @ts-expect-error the default factory makes non-empty runs
    result.runs[0].instructors = []
    result.topics = []
    const object = courseSearchResultToLearningResource(result)
    const wrapper = render(object)
    expect(wrapper.find(".subtitles")).toHaveLength(0)
  })

  it("should link to the course subjects", () => {
    const object = courseSearchResultToLearningResource(
      makeCourseSearchResult()
    )
    const wrapper = render(object)

    wrapper.find(".topic-link").forEach((link, i) => {
      const { href } = link.props()
      expect(href).toBe(
        `${SEARCH_URL}?${serializeSearchParams({
          text:         undefined,
          activeFacets: {
            topic: [object.topics[i].name]
          }
        })}`
      )
    })
  })
})

describe("SearchResult component with compact view", () => {
  const render = (object: LearningResource) =>
    mount(<SearchResult id="boop" index={0} object={object} layout="compact" />)

  it("should render the things we expect for a course", () => {
    const object = courseSearchResultToLearningResource(
      makeCourseSearchResult()
    )
    const wrapper = render(object)
    expect(wrapper.find(".course-title").text()).toBe(object.title)
    const { href } = wrapper.find(".course-title").find("a").props()
    expect(href).toBe(object.url)
    expect(wrapper.find(".course-num").text()).toBe(object.coursenum)
    expect(wrapper.find(".resource-level").text()).toBe(
      object.level ? object.level.join(", ") : ""
    )
  })

  it("should render the things we expect for a resource", () => {
    const object = resourceSearchResultToLearningResource(
      makeContentFileSearchResult()
    )
    const wrapper = render(object)

    expect(wrapper.find(".resource-title").text()).toBe(object.content_title)
    expect(wrapper.find(".resource-title").find("a").prop("href")).toBe(
      object.url
    )
    expect(wrapper.find("img").first().prop("src")).toBe(
      getCoverImageUrl(object)
    )
    expect(wrapper.find("CoverImage").exists()).toBeTruthy()
    expect(wrapper.find(".resource-course-title").text()).toBe(object.run_title)
    expect(wrapper.find(".course-num").text()).toBe(object.coursenum)
  })
})
