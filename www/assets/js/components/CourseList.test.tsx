import { render, screen } from "@testing-library/react"
import { makeCourseJSON } from "../factories/search"
import { LearningResource } from "../LearningResources"
import { courseJSONToLearningResource } from "../lib/search"
import * as hugoHooks from "../hooks/hugo_data"
import CourseList from "./CourseList"
import CourseListRow from "./CourseListRow"

const { useCourseListData } = hugoHooks as jest.Mocked<typeof hugoHooks>
jest.mock("../hooks/hugo_data")

jest.mock("./CourseListRow", () => {
  const actual = jest.requireActual("./CourseListRow")
  return {
    __esModule: true,
    default:    jest.fn(actual.default)
  }
})

const mockCourseListRow = jest.mocked(CourseListRow)

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

    expect(useCourseListData).toHaveBeenCalledWith("test-uid")

    expect(CourseListRow).toHaveBeenCalledTimes(data.length)

    mockCourseListRow.mock.calls.forEach((call, index) => {
      expect(call[0].course).toEqual(data[index])
    })
  })
})
