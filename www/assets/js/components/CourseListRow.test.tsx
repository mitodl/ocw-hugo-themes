import { render, screen } from "@testing-library/react"
import { LearningResourceType } from "@mitodl/course-search-utils"
import invariant from "tiny-invariant"

import { makeLearningResourceResult } from "../factories/search"
import { searchResultToLearningResource } from "../lib/search"
import CourseListRow from "./CourseListRow"

function setup() {
  const course = searchResultToLearningResource(
    makeLearningResourceResult(LearningResourceType.Course)
  )

  const utils = render(<CourseListRow course={course} />)

  return { course, ...utils }
}

test("should have a link with the course URL", () => {
  const { course } = setup()
  const link = screen.getByRole("link")
  expect(link).toHaveAttribute("href", course.url)
})

test("should show the cover image", () => {
  const { course } = setup()
  const image = screen.getByRole("img")
  expect(image).toHaveAttribute("src", course.image_src)
})

test("should show the title, coursenum, level", () => {
  const { course } = setup()
  expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
    course.title
  )
  invariant(course.coursenum, "coursenum should not be missing")

  const expectedLevel = course.level ? course.level.join(", ") : ""
  expect(screen.getByText(expectedLevel)).toBeInTheDocument()
})
