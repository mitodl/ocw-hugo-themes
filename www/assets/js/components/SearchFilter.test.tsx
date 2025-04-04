import React from "react"
import upperCase from "lodash.uppercase"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import SearchFilter from "./SearchFilter"

describe("SearchFilter", () => {
  function setup() {
    const clearFacet = jest.fn()

    const renderComponent = (props = {}) =>
      render(<SearchFilter clearFacet={clearFacet} value="" {...props} />)

    return { renderComponent, clearFacet }
  }

  it("should render a search filter correctly", () => {
    const value = "Upcoming"
    const { renderComponent } = setup()

    renderComponent({
      value,
      labelFunction: upperCase
    })

    expect(screen.getByText(upperCase(value))).toBeInTheDocument()
  })

  it("should render a value without transformation", () => {
    const value = "Upcoming"
    const { renderComponent } = setup()

    renderComponent({ value })

    expect(screen.getByText(value)).toBeInTheDocument()
  })

  it("should trigger clearFacet function on click", async () => {
    const { renderComponent, clearFacet } = setup()
    renderComponent({ value: "ocw" })

    const removeButton = screen.getByRole("button", { name: /clear filter/i })

    await userEvent.click(removeButton)

    expect(clearFacet).toHaveBeenCalledTimes(1)
  })
})
