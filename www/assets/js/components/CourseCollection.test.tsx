import { mount } from "enzyme"
import { makeCourseJSON } from "../factories/search"
import { LearningResource } from "../LearningResources"
import { courseJSONToLearningResource } from "../lib/search"
import { useCourseCollectionData } from "../hooks/course_collection"
import React from "react"
import CourseCollection from "./CourseCollection"

jest.mock("../hooks/course_collection")

describe("CourseCollection component", () => {
  let data: LearningResource[]

  const render = () => mount(<CourseCollection />)

  beforeEach(() => {
    data = [...Array(10)]
      .map(makeCourseJSON)
      .map((courseJSON, index) =>
        courseJSONToLearningResource(`course-${index}`, courseJSON)
      )

    // @ts-ignore
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
