import React from "react"
import { mount } from "enzyme"
import {
  serializeSearchParams,
  LearningResourceType
} from "@mitodl/course-search-utils"

import SearchResult from "./SearchResult"

import { makeLearningResourceResult } from "../factories/search"
import { SEARCH_URL } from "../lib/constants"
import { getCoverImageUrl, searchResultToLearningResource } from "../lib/search"
import { LearningResource } from "../LearningResources"

describe("SearchResult component", () => {
  const render = (object: LearningResource) =>
    mount(<SearchResult id="boop" index={0} object={object} />)

  it("should render the things we expect for a course", () => {
    const object = searchResultToLearningResource(
      makeLearningResourceResult(LearningResourceType.Course)
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
    ).toContain(object.instructors[0])
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
      makeLearningResourceResult(LearningResourceType.ResourceFile)
    )
    const wrapper = render(object)
    expect(wrapper.find(".course-title").text()).toBe(object.content_title)
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
    ).toBe(object.description)
    expect(
      wrapper
        .find("img")
        .first()
        .prop("src")
    ).toBe(getCoverImageUrl(object))
    expect(wrapper.find(".topics-list").text()).toContain(
      object.topics[0]["name"]
    )
    expect(wrapper.find("CoverImage").exists()).toBeTruthy()
  })

  //
  ;[(LearningResourceType.ResourceFile, LearningResourceType.Course)].forEach(
    objectType => {
      it("should not render a course/resource with no url", () => {
        const object = searchResultToLearningResource(
          // @ts-ignore
          makeLearningResourceResult(objectType)
        )
        object.url = null
        const wrapper = render(object)
        expect(wrapper.find("Card").exists()).toBeFalsy()
      })
    }
  )

  //
  ;[[], null].forEach(listValue => {
    it(`should not render div for instructors, topics if they equal ${String(
      listValue
    )}`, () => {
      const result = makeLearningResourceResult(LearningResourceType.Course)
      // @ts-ignore
      result.runs[0].instructors = listValue
      // @ts-ignore
      result.topics = listValue
      const object = searchResultToLearningResource(result)
      const wrapper = render(object)
      expect(wrapper.find(".subtitles")).toHaveLength(0)
    })
  })

  it("should link to the course subjects", () => {
    const object = searchResultToLearningResource(
      makeLearningResourceResult(LearningResourceType.Course)
    )
    const wrapper = render(object)

    wrapper.find(".topic-link").forEach((link, i) => {
      const { href } = link.props()
      expect(href).toBe(
        `${SEARCH_URL}?${serializeSearchParams({
          text:         undefined,
          activeFacets: {
            // @ts-ignore
            topics: object.topics[i].name
          }
        })}`
      )
    })
  })
})
