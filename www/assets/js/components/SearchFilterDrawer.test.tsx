import React from "react"
import { shallow } from "enzyme"

import SearchFilterDrawer from "./SearchFilterDrawer"
import { FacetDisplay } from "@mitodl/course-search-utils"
import * as utils from "../lib/util"

jest.mock("../lib/util", () => {
  const actual = jest.requireActual("../lib/util")
  return {
    ...actual,
    getViewportWidth: jest.fn()
  }
})
const getViewportWidthMock = jest.mocked(utils.getViewportWidth)

describe("SearchFilterDrawer component", () => {
  // @ts-expect-error Most props not needed here
  const render = (props = {}) => shallow(<SearchFilterDrawer {...props} />)

  test("desktop mode renders a FacetDisplay", async () => {
    getViewportWidthMock.mockImplementation(() => 1000)
    const wrapper = render()
    expect(wrapper.find(FacetDisplay).exists()).toBeTruthy()
    expect(wrapper.find(".layout-buttons-mobile").exists()).toBeFalsy()
  })

  test("phone mode renders a filter control and layout buttons", async () => {
    getViewportWidthMock.mockImplementation(() => 500)
    const wrapper = render()
    const filterDrawerButton = wrapper.find(".filter-drawer-button")
    const mockEvent = { preventDefault: jest.fn() }
    expect(filterDrawerButton.text()).toBe("Filterarrow_drop_down")
    filterDrawerButton.simulate("click", mockEvent)
    wrapper.update()
    expect(wrapper.find(".search-filter-drawer-open").exists()).toBeTruthy()
    expect(wrapper.find(FacetDisplay).exists()).toBeTruthy()
    wrapper.find(".blue-btn").simulate("click", mockEvent)
    wrapper.update()
    expect(wrapper.find(".search-filter-drawer-open").exists()).toBeFalsy()
    expect(wrapper.find(".layout-buttons-mobile").exists()).toBeTruthy()
  })
})
