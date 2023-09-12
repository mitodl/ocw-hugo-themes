import React from "react"
import upperCase from "lodash.uppercase"
import { shallow } from "enzyme"

import SearchFilter from "./SearchFilter"

describe("SearchFilter", () => {
  function setup() {
    const onClickStub = jest.fn()

    const render = (props = {}) =>
      shallow(<SearchFilter clearFacet={onClickStub} value="" {...props} />)

    return { render, onClickStub }
  }

  it("should render a search filter correctly", () => {
    const value = "Upcoming"
    const { render } = setup()
    const wrapper = render({
      value,
      labelFunction: upperCase
    })
    const label = wrapper.text()
    expect(label.includes(upperCase(value))).toBeTruthy()
  })

  it("should trigger clearFacet function on click", async () => {
    const { render, onClickStub } = setup()
    const wrapper = render({ value: "ocw" })
    wrapper.find(".remove-filter-button").simulate("click")
    expect(onClickStub).toHaveBeenCalledTimes(1)
  })
})
