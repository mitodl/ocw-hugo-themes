import { render, screen } from "@testing-library/react"
import { makeCourseJSON } from "../factories/search"
import { LearningResource } from "../LearningResources"
import { courseJSONToLearningResource } from "../lib/search"
import * as hugoHooks from "../hooks/hugo_data"
import React from "react"
import CourseList from "./CourseList"
import CourseListRow from "./CourseListRow"

const { useCourseListData } = hugoHooks as jest.Mocked<typeof hugoHooks>
jest.mock("../hooks/hugo_data")

jest.mock("./CourseListRow", () => {
  return {
    __esModule: true,
    default:    jest.fn(({ course }) => {
      return (
        <div data-testid="course-list-row" data-course-id={course.id}>
          {course.title}
        </div>
      )
    })
  }
})

describe("CourseList component", () => {
  let data: LearningResource[]

  beforeEach(() => {
    jest.clearAllMocks()
    data = [...Array(10)]
      .map(makeCourseJSON)
      .map((courseJSON, index) =>
        courseJSONToLearningResource(`course-${index}`, courseJSON)
      )
    useCourseListData.mockReturnValue(data)
  })

  it("should show a list of courses", () => {
    render(<CourseList uid="test-uid" />)

    const courseRows = screen.getAllByTestId("course-list-row")
    expect(courseRows.length).toBe(data.length)

    expect(useCourseListData).toBeCalledWith("test-uid")

    expect(CourseListRow).toHaveBeenCalledTimes(data.length)

    const expectedCalls = data.map(course => [{ course }, expect.anything()])
    expect((CourseListRow as jest.Mock).mock.calls).toEqual(expectedCalls)
  })
})
