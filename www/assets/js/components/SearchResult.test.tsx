import { render, screen } from "@testing-library/react"
import {
  serializeSearchParams,
  LearningResourceType
} from "@mitodl/course-search-utils"

import SearchResult from "./SearchResult"

import { makeLearningResourceResult } from "../factories/search"
import { SEARCH_URL } from "../lib/constants"
import { getCoverImageUrl, searchResultToLearningResource } from "../lib/search"
import { LearningResource } from "../LearningResources"
import invariant from "tiny-invariant"

describe("SearchResult component", () => {
  const renderComponent = (object: LearningResource) =>
    render(<SearchResult id="boop" index={0} object={object} />)

  it("should render the things we expect for a course", () => {
    const object = searchResultToLearningResource(
      makeLearningResourceResult(LearningResourceType.Course)
    )
    renderComponent(object)

    const titleLink = screen.getByRole("link", { name: object.title })
    expect(titleLink).toHaveAttribute("href", object.url)
    expect(titleLink).toHaveClass("w-100")

    expect(
      screen.getByText(object.instructors[0], { exact: false })
    ).toBeInTheDocument()

    const coverImageRoot = screen.getByTestId("cover-image")
    const coverImage = coverImageRoot.querySelector("img")
    invariant(coverImage) // assert that coverImage is found
    expect(coverImage).toHaveAttribute("src", getCoverImageUrl(object))
  })

  it("should render the things we expect for a resource", () => {
    const object = searchResultToLearningResource(
      makeLearningResourceResult(LearningResourceType.ResourceFile)
    )
    renderComponent(object)

    const titleElement = screen.getByText(object.content_title || "")
    expect(titleElement).toBeInTheDocument()

    const titleLink = titleElement.closest("a")
    expect(titleLink).toHaveAttribute("href", object.url)

    if (object.description) {
      expect(screen.getByText(object.description)).toBeInTheDocument()
    }

    const coverImage = screen.getByRole("img")
    expect(coverImage).toHaveAttribute("src", getCoverImageUrl(object))

    expect(
      screen.getByText(object.topics[0].name, { exact: false })
    ).toBeInTheDocument()
  })

  //
  ;[LearningResourceType.ResourceFile, LearningResourceType.Course].forEach(
    objectType => {
      it("should not render a course/resource with no url", () => {
        const object = searchResultToLearningResource(
          makeLearningResourceResult(objectType)
        )
        object.url = null
        renderComponent(object)

        expect(screen.queryByRole("article")).not.toBeInTheDocument()
      })
    }
  )

  //
  ;[[], null].forEach(listValue => {
    it(`should not render div for instructors, topics if they are ${JSON.stringify(
      listValue
    )}`, () => {
      const result = makeLearningResourceResult(LearningResourceType.Course)
      result.runs[0].instructors = listValue as unknown as string[]
      result.topics = listValue as unknown as string[]
      const object = searchResultToLearningResource(result)
      renderComponent(object)

      expect(
        screen.queryByText("Topic", { exact: false })
      ).not.toBeInTheDocument()
      if (object.instructors && object.instructors.length) {
        expect(
          screen.getByText(object.instructors[0], { exact: false })
        ).toBeInTheDocument()
      } else {
        expect(document.querySelector(".subtitles")).toBeNull()
      }
    })
  })

  it("should link to the course subjects", () => {
    const object = searchResultToLearningResource(
      makeLearningResourceResult(LearningResourceType.Course)
    )
    renderComponent(object)

    object.topics.forEach(topic => {
      const topicLink = screen.getByRole("link", { name: topic.name })
      expect(topicLink).toHaveAttribute(
        "href",
        `${SEARCH_URL}?${serializeSearchParams({
          text:         undefined,
          activeFacets: {
            topics: [topic.name]
          }
        })}`
      )
    })
  })
})

describe("SearchResult component with compact view", () => {
  const renderComponent = (object: LearningResource) =>
    render(
      <SearchResult id="boop" index={0} object={object} layout="compact" />
    )

  it("should render the things we expect for a course", () => {
    const object = searchResultToLearningResource(
      makeLearningResourceResult(LearningResourceType.Course)
    )
    renderComponent(object)

    const titleLink = screen.getByRole("link", { name: object.title })
    expect(titleLink).toHaveAttribute("href", object.url)

    if (object.coursenum) {
      expect(screen.getByText(object.coursenum)).toBeInTheDocument()
    }

    if (object.level) {
      expect(screen.getByText(object.level.join(", "))).toBeInTheDocument()
    }
  })

  it("should render the things we expect for a resource", () => {
    const object = searchResultToLearningResource(
      makeLearningResourceResult(LearningResourceType.ResourceFile)
    )
    renderComponent(object)

    const titleElement = screen.getByText(object.content_title || "")
    expect(titleElement).toBeInTheDocument()

    const titleLink = titleElement.closest("a")
    expect(titleLink).toHaveAttribute("href", object.url)

    const coverImage = screen.getByRole("img")
    expect(coverImage).toHaveAttribute("src", getCoverImageUrl(object))

    if (object.run_title) {
      expect(screen.getByText(object.run_title)).toBeInTheDocument()
    }
    if (object.coursenum) {
      expect(screen.getByText(object.coursenum)).toBeInTheDocument()
    }
  })
})
