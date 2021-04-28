import React from "react"
import { mount } from "enzyme"
import { serializeSearchParams } from "@mitodl/course-search-utils/dist/url_utils"
import {
  LR_TYPE_COURSE,
  LR_TYPE_RESOURCEFILE
} from "@mitodl/course-search-utils/dist/constants"

import SearchResult from "./SearchResult"

import { makeLearningResourceResult } from "../factories/search"
import { SEARCH_URL } from "../lib/constants"
import {
  getContentIcon,
  getCoverImageUrl,
  searchResultToLearningResource
} from "../lib/search"

describe("SearchResult component", () => {
  const render = object => mount(<SearchResult object={object} />)

  it("should render the things we expect for a course", () => {
    const object = searchResultToLearningResource(
      makeLearningResourceResult(LR_TYPE_COURSE)
    )
    const wrapper = render(object)
    expect(wrapper.find(".course-title").text()).toBe(object.title)
    const { href, className } = wrapper
      .find(".course-title")
      .find("a")
      .props()
    expect(href).toBe(object.url)
    expect(className).toBe("w-100")
    expect(
      wrapper
        .find(".subtitles")
        .first()
        .text()
    ).toContain("Instructors")
    expect(
      wrapper
        .find(".subtitles")
        .first()
        .text()
    ).toContain(`Prof. ${object.instructors[0]}`)
    expect(
      wrapper
        .find(".cover-image")
        .find("img")
        .first()
        .prop("src")
    ).toBe(getCoverImageUrl(object))
    expect(wrapper.find("CoverImage").exists()).toBeTruthy()
  })

  it("should render the things we expect for a resource", () => {
    const object = searchResultToLearningResource(
      makeLearningResourceResult(LR_TYPE_RESOURCEFILE)
    )
    const wrapper = render(object)
    expect(wrapper.find(".course-title").text()).toBe(
      `${getContentIcon(object.content_type)}${object.content_title}`
    )
    expect(
      wrapper
        .find(".course-title")
        .find("a")
        .prop("href")
    ).toBe(object.url)
    expect(
      wrapper
        .find(".subtitles")
        .first()
        .text()
    ).toBe(`${object.coursenum} ${object.run_title}`)
    expect(
      wrapper
        .find(".subtitles")
        .at(1)
        .text()
    ).toContain("Topic")
    expect(
      wrapper
        .find(".cover-image")
        .find("img")
        .first()
        .prop("src")
    ).toBe(getCoverImageUrl(object))
    expect(wrapper.find("CoverImage").exists()).toBeTruthy()
  })

  //
  ;[(LR_TYPE_RESOURCEFILE, LR_TYPE_COURSE)].forEach(objectType => {
    it("should not render a course/resource with no url", () => {
      const object = searchResultToLearningResource(
        makeLearningResourceResult(objectType)
      )
      object.url = null
      const wrapper = render(object)
      expect(wrapper.find("Card").exists()).toBeFalsy()
    })
  })

  //
  ;[[], null].forEach(listValue => {
    it(`should not render div for instructors, topics if they equal ${String(
      listValue
    )}`, () => {
      const result = makeLearningResourceResult(LR_TYPE_COURSE)
      result.runs[0].instructor = listValue
      result.topics = listValue
      const object = searchResultToLearningResource(result)
      const wrapper = render(object)
      expect(wrapper.find(".subtitles")).toHaveLength(1)
    })
  })

  it("should link to the course subjects", () => {
    const object = makeLearningResourceResult(LR_TYPE_COURSE)
    const wrapper = render(object)

    wrapper.find(".topic-link").forEach((link, i) => {
      const { href } = link.props()
      expect(href).toBe(
        `${SEARCH_URL}?${serializeSearchParams({
          text:         undefined,
          activeFacets: {
            topics: object.topics[i].name
          }
        })}`
      )
    })
  })
})
