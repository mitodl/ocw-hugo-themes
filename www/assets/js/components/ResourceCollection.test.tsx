import React from "react"
import { render, screen } from "@testing-library/react"
import { makeResourceFileResult } from "../factories/search"
import { searchResultToLearningResource } from "../lib/search"
import * as hugoHooks from "../hooks/hugo_data"
import ResourceCollection from "./ResourceCollection"
import { LearningResourceDisplay } from "./SearchResult"

const { useResourceCollectionData } = hugoHooks as jest.Mocked<typeof hugoHooks>
jest.mock("../hooks/hugo_data")

jest.mock("./SearchResult", () => ({
  LearningResourceDisplay: jest.fn(({ object }) => (
    <div data-testid="learning-resource" data-resource-id={object.id}>
      {object.title}
    </div>
  ))
}))

function setup() {
  const data = [...Array(10)]
    .map((_, index) =>
      makeResourceFileResult({
        id:    index + 1,
        title: `Test Resource ${index + 1}`
      })
    )
    .map(searchResultToLearningResource)

  useResourceCollectionData.mockReturnValue(data)

  const utils = render(<ResourceCollection />)

  return {
    ...utils,
    data
  }
}

test("should show a list of resources", () => {
  const { data } = setup()

  const resourceElements = screen.getAllByTestId("learning-resource")
  expect(resourceElements).toHaveLength(data.length)

  data.forEach(resource => {
    const resourceId = String(resource.id)
    const element = screen
      .getAllByTestId("learning-resource")
      .find(el => el.getAttribute("data-resource-id") === resourceId)
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent(resource.title)
  })

  data.forEach(resource => {
    expect(LearningResourceDisplay).toHaveBeenCalledWith(
      expect.objectContaining({ object: resource }),
      expect.anything()
    )
  })
})
