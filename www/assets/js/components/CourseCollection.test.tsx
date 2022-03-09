import { mount } from "enzyme"
import { makeCourseJSON } from "../factories/search"
import { LearningResource } from "../LearningResources"
import { courseJSONToLearningResource } from "../lib/search"
import * as hugoHooks from "../hooks/hugo_data"
import React from "react"
import CourseCollection from "./CourseCollection"
import CourseCollectionRow from "./CourseCollectionRow"

const { useCourseCollectionData } = hugoHooks as jest.Mocked<typeof hugoHooks>
jest.mock("../hooks/hugo_data")

describe("CourseCollection component", () => {
  let data: LearningResource[]

  const render = () => mount(<CourseCollection uid="test-uid" />)

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
        .find(CourseCollectionRow)
        .map(component => component.prop("course"))
    ).toEqual(data)
    expect(useCourseCollectionData).toBeCalledWith("test-uid")
  })
})
