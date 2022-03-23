import React from "react"
import { shallow } from "enzyme"

import FacetDisplay from "./FacetDisplay"
import { FacetManifest } from "../LearningResources"
import { Facets } from "@mitodl/course-search-utils"

describe("FacetDisplay component", () => {
  const facetMap: FacetManifest = [
    ["topics", "Topics", false],
    ["type", "Types", false],
    ["department_name", "Departments", false]
  ]

  function setup() {
    const activeFacets = {}
    const facetOptions = jest.fn()
    const onUpdateFacets = jest.fn()
    const clearAllFilters = jest.fn()
    const toggleFacet = jest.fn()

    const render = (props = {}) =>
      shallow(
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
    return { render, clearAllFilters }
  }

  test("renders a FacetDisplay with expected FilterableFacets", async () => {
    const { render } = setup()
    const wrapper = render()
    const facets = wrapper.children()
    expect(facets).toHaveLength(4)
    facets.slice(1, 4).map((facet, key) => {
      expect(facet.prop("name")).toBe(facetMap[key][0])
      expect(facet.prop("title")).toBe(facetMap[key][1])
    })
  })

  test("shows filters which are active", () => {
    const activeFacets: Facets = {
      topics:          ["Pasta", "Bread", "Starch"],
      type:            [],
      department_name: ["World Grains and Cereals"]
    }

    const { render, clearAllFilters } = setup()
    const wrapper = render({
      activeFacets
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
