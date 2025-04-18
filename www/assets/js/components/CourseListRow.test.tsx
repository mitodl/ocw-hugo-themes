import { render, screen } from "@testing-library/react"
import invariant from "tiny-invariant"

import { makeCourseResult } from "../factories/search"
import { searchResultToLearningResource } from "../lib/search"
import CourseListRow from "./CourseListRow"
import { Level } from "../LearningResources"

function setup(overrides: { level?: Level[] | null } = {}) {
  const courseResult = makeCourseResult(overrides)

  const course = {
    ...searchResultToLearningResource(courseResult),
    level: overrides.level !== undefined ? overrides.level : courseResult.level
  }

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

test("should show the title and coursenum", () => {
  const { course } = setup()
  expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
    course.title
  )
  invariant(course.coursenum, "coursenum should not be missing")
})

test("should show the level when it has values", () => {
  const { course } = setup({ level: ["Graduate", "Undergraduate"] as Level[] })

  expect(course.level).toEqual(["Graduate", "Undergraduate"])
  expect(screen.getByText("Graduate, Undergraduate")).toBeInTheDocument()
})

test("should not display level text when level is empty", () => {
  const { course } = setup({ level: [] as Level[] })

  expect(course.level).toEqual([])
  const levelDiv = document.querySelector(".level")
  expect(levelDiv).toBeEmptyDOMElement()
})

test("should not display level text when level is null", () => {
  const { course } = setup({ level: null })

  expect(course.level).toBe(null)
  const levelDiv = document.querySelector(".level")
  expect(levelDiv).toBeEmptyDOMElement()
})
