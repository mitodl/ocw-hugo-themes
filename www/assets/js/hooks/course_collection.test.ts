import { renderHook } from "@testing-library/react-hooks"
import { makeCourseJSON } from "../factories/search"
import { courseJSONToLearningResource } from "../lib/search"
import { OCWWindow, useCourseCollectionData } from "./course_collection"

declare let window: OCWWindow

describe("Course Collection hooks", () => {
  beforeEach(() => {
    window.courseCollectionContents = Object.fromEntries(
      [...Array(10)].map((_, index) => [`course-${index}`, makeCourseJSON()])
    )
  })

  it("should pull out courseJSON objects from window, return LearningResources", () => {
    const { result } = renderHook(useCourseCollectionData)
    expect(result.current).toEqual(
      Object.entries(
        window.courseCollectionContents
      ).map(([name, courseJSON]) =>
        courseJSONToLearningResource(name, courseJSON)
      )
    )
  })

  it("should throw if the property isn't set", () => {
    // @ts-ignore
    window.courseCollectionContents = undefined
    const { result } = renderHook(useCourseCollectionData)
    expect(result.error).toEqual(Error("course collection data missing"))
  })
})
