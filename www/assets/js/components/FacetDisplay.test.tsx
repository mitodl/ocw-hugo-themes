import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const mockFilterableFacet = jest.fn(
  ({ name, title, expandedOnLoad, children }) => (
    <div
      data-testid="filterable-facet"
      data-name={name}
      data-title={title}
      data-expanded={expandedOnLoad ? "true" : "false"}
    >
      {children}
    </div>
  )
)

const mockSearchFilter = jest.fn(({ value, children }) => (
  <div data-testid="search-filter" data-value={value}>
    {children}
  </div>
))

jest.mock("./FilterableFacet", () => ({
  __esModule: true,
  default:    mockFilterableFacet
}))

jest.mock("./SearchFilter", () => ({
  __esModule: true,
  default:    mockSearchFilter
}))

import FacetDisplay from "./FacetDisplay"
import { FacetManifest } from "../LearningResources"
import { Facets } from "@mitodl/course-search-utils"

describe("FacetDisplay component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFilterableFacet.mockClear()
    mockSearchFilter.mockClear()
  })

  const facetMap: FacetManifest = [
    ["topics", "Topics", true, false],
    ["type", "Types", true, false],
    ["department_name", "Departments", true, true]
  ]

  function setup() {
    const activeFacets = {}
    const facetOptions = jest.fn()
    const onUpdateFacets = jest.fn()
    const clearAllFilters = jest.fn()
    const toggleFacet = jest.fn()

    const renderComponent = (props = {}) =>
      render(
        <FacetDisplay
          facetMap={facetMap}
          facetOptions={facetOptions}
          activeFacets={activeFacets}
          onUpdateFacets={onUpdateFacets}
          clearAllFilters={clearAllFilters}
          toggleFacet={toggleFacet}
          {...props}
        />
      )

    return { renderComponent, clearAllFilters }
  }

  test("renders FilterableFacets based on facetMap", () => {
    const { renderComponent } = setup()
    renderComponent()

    expect(mockFilterableFacet).toHaveBeenCalledTimes(3)
    facetMap.forEach((facetInfo, idx) => {
      expect(mockFilterableFacet).toHaveBeenNthCalledWith(
        idx + 1,
        expect.objectContaining({
          name:           facetInfo[0],
          title:          facetInfo[1],
          expandedOnLoad: facetInfo[3]
        }),
        expect.anything()
      )
    })
  })

  test("shows filters which are active excluding invalid facet values", async () => {
    const activeFacets: Facets = {
      topics: [
        "Academic Writing",
        "Accounting",
        "Aerodynamics",
        "Pasta",
        "Bread",
        "Starch"
      ],
      type:            [],
      department_name: ["Mathematics", "World Grains and Cereals"]
    }

    const { renderComponent, clearAllFilters } = setup()
    renderComponent({ activeFacets })

    expect(mockSearchFilter).toHaveBeenCalledWith(
      expect.objectContaining({ value: "Academic Writing" }),
      expect.anything()
    )

    const clearButton = screen.getByText("Clear All")
    await userEvent.click(clearButton)
    expect(clearAllFilters).toHaveBeenCalled()
  })
})
