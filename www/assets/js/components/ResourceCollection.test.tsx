import React from "react"
import { mount } from "enzyme"
import { makeContentFileSearchResult } from "../factories/search"
import { resourceSearchResultToLearningResource } from "../lib/search"
import * as hugoHooks from "../hooks/hugo_data"
import ResourceCollection from "./ResourceCollection"
import { LearningResourceDisplay } from "./SearchResult"

const { useResourceCollectionData } = hugoHooks as jest.Mocked<typeof hugoHooks>
jest.mock("../hooks/hugo_data")

function setup() {
  const data = [...Array(10)]
    .map(makeContentFileSearchResult)
    .map(resourceSearchResultToLearningResource)

  useResourceCollectionData.mockReturnValue(data)

  return {
    wrapper: mount(<ResourceCollection />),
    data
  }
}

test("should show a list of resources", () => {
  const { wrapper, data } = setup()

  expect(
    wrapper
      .find(LearningResourceDisplay)
      .map(lrDisplay => lrDisplay.prop("object"))
  ).toEqual(data)
})
