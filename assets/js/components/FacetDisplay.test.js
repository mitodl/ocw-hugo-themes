import React from "react"
import { shallow } from "enzyme"

import FacetDisplay from "./FacetDisplay"

describe("FacetDisplay component", () => {
  let activeFacets, facetOptions, onUpdateFacets, clearAllFilters

  const render = (props = {}) =>
    shallow(
      <FacetDisplay
        facetMap={facetMap}
        facetOptions={facetOptions}
        activeFacets={activeFacets}
        onUpdateFacets={onUpdateFacets}
        clearAllFilters={clearAllFilters}
        {...props}
      />
    )

  const facetMap = [
    ["topics", "Topics"],
    ["types", "Types"],
    ["departments", "Departments"]
  ]

  beforeEach(() => {
    activeFacets = {}
    facetOptions = jest.fn()
    onUpdateFacets = jest.fn()
    clearAllFilters = jest.fn()
  })

  test("renders a FacetDisplay with expected FilterableFacets", async () => {
    const wrapper = render()
    const facets = wrapper.children()
    expect(facets).toHaveLength(3)
    facets.map((facet, key) => {
      expect(facet.prop("name")).toBe(facetMap[key][0])
      expect(facet.prop("title")).toBe(facetMap[key][1])
    })
  })

  test("shows filters which are active", () => {
    activeFacets = {
      topics:      ["Pasta", "Bread", "Starch"],
      types:       [],
      departments: ["World Grains and Cereals"]
    }

    const wrapper = render({
      facetMap,
      facetOptions,
      activeFacets,
      onUpdateFacets
    })
    expect(
      wrapper
        .find(".active-search-filters")
        .find("SearchFilter")
        .map(el => el.prop("value"))
    ).toEqual(["Pasta", "Bread", "Starch", "World Grains and Cereals"])
    wrapper.find(".clear-all-filters").simulate("click")
    expect(clearAllFilters).toHaveBeenCalled()
  })
})
