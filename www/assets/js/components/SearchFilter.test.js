import React from "react"
import upperCase from "lodash.uppercase"
import { shallow } from "enzyme"

import SearchFilter from "./SearchFilter"

describe("SearchFilter", () => {
  let onClickStub

  const renderSearchFilter = props =>
    shallow(<SearchFilter clearFacet={onClickStub} {...props} />)

  beforeEach(() => {
    onClickStub = jest.fn()
  })

  it("should render a search filter correctly", () => {
    const value = "Upcoming"
    const wrapper = renderSearchFilter({
      value,
      labelFunction: upperCase
    })
    const label = wrapper.text()
    expect(label.includes(upperCase(value))).toBeTruthy()
  })

  it("should trigger clearFacet function on click", async () => {
    const wrapper = renderSearchFilter({ value: "ocw" })
    wrapper.find(".remove-filter").simulate("click")
    expect(onClickStub).toHaveBeenCalledTimes(1)
  })
})
