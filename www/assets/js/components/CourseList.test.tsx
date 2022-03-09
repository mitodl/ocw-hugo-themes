import { mount } from "enzyme"
import { makeCourseJSON } from "../factories/search"
import { LearningResource } from "../LearningResources"
import { courseJSONToLearningResource } from "../lib/search"
import * as hugoHooks from "../hooks/hugo_data"
import React from "react"
import CourseList from "./CourseList"
import CourseListRow from "./CourseListRow"

const { useCourseListData } = hugoHooks as jest.Mocked<typeof hugoHooks>
jest.mock("../hooks/hugo_data")

describe("CourseList component", () => {
  let data: LearningResource[]

  const render = () => mount(<CourseList uid="test-uid" />)

  beforeEach(() => {
    data = [...Array(10)]
      .map(makeCourseJSON)
      .map((courseJSON, index) =>
        courseJSONToLearningResource(`course-${index}`, courseJSON)
      )
    useCourseListData.mockReturnValue(data)
  })

  it("should show a list of courses", () => {
    const wrapper = render()

    expect(
      wrapper.find(CourseListRow).map(component => component.prop("course"))
    ).toEqual(data)
    expect(useCourseListData).toBeCalledWith("test-uid")
  })
})
