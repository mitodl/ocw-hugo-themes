import React from "react"
import { render, screen } from "@testing-library/react"

import Loading, { AnimatedEmptyCard, Spinner } from "./Loading"

describe("Loading", () => {
  test("should render ten cards", () => {
    render(<Loading />)
    const cards = screen.getAllByTestId("animated-card")
    expect(cards.length).toBe(10)
  })

  test("Card should render what we want", () => {
    render(<AnimatedEmptyCard />)

    const wrapper = screen.getByTestId("animated-card")
    const card = wrapper.querySelector(".compact-post-summary")
    expect(card).toBeInTheDocument()

    const contentLoader = screen.getByRole("img", { hidden: true })
    expect(contentLoader).toBeInTheDocument()

    const rects = document.querySelectorAll("rect")
    expect(rects.length).toBe(6)
  })

  describe("Spinner", () => {
    test("should render the right divs", () => {
      render(<Spinner />)

      const spinnerContainer = screen.getByTestId("spinner")
      expect(spinnerContainer).toHaveClass("loading")
      expect(spinnerContainer.querySelector(".spinner")).toBeInTheDocument()

      const bounceElements = screen.getAllByTestId("bounce")
      expect(bounceElements.length).toBe(3)

      expect(bounceElements[0]).toHaveClass("bounce1")
      expect(bounceElements[1]).toHaveClass("bounce2")
      expect(bounceElements[2]).toHaveClass("bounce3")
    })

    test("should let you set a className", () => {
      render(<Spinner className="not-loading-lol" />)
      const container = screen.getByTestId("spinner")
      expect(container).toHaveClass("loading")
      expect(container).toHaveClass("not-loading-lol")
    })
  })
})
