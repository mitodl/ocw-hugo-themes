import { mount } from "enzyme"
import { makeCourseJSON } from "../factories/search"
import { LearningResource } from "../LearningResources"
import { courseJSONToLearningResource } from "../lib/search"
import * as hugoHooks from "../hooks/hugo_data"
import React from "react"
import CourseCollection from "./CourseCollection"

const { useCourseCollectionData } = hugoHooks as jest.Mocked<typeof hugoHooks>
jest.mock("../hooks/hugo_data")

describe("CourseCollection component", () => {
  let data: LearningResource[]

  const render = () => mount(<CourseCollection />)

  beforeEach(() => {
    data = [...Array(10)]
      .map(makeCourseJSON)
      .map((courseJSON, index) =>
        courseJSONToLearningResource(`course-${index}`, courseJSON)
      )
    useCourseCollectionData.mockReturnValue(data)
  })

  it("should show a list of courses", () => {
    const wrapper = render()

    expect(
      wrapper
        .find("LearningResourceDisplay")
        .map(component => component.prop("object"))
    ).toEqual(data)
  })
})
