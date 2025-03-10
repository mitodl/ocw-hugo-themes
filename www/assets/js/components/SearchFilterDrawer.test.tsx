import React from "react"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SearchFilterDrawer from "./SearchFilterDrawer"
import * as utils from "../lib/util"

jest.mock("./FacetDisplay", () => {
  return {
    __esModule: true,
    default:    () => <div data-testid="facet-display">Mocked FacetDisplay</div>
  }
})

jest.mock("../lib/util", () => {
  const actual = jest.requireActual("../lib/util")
  return {
    ...actual,
    getViewportWidth: jest.fn()
  }
})

const getViewportWidthMock = jest.mocked(utils.getViewportWidth)

describe("SearchFilterDrawer component", () => {
  const defaultProps = {
    facetMap:        [],
    facetOptions:    jest.fn(),
    activeFacets:    {},
    onUpdateFacets:  jest.fn(),
    clearAllFilters: jest.fn(),
    toggleFacet:     jest.fn(),
    updateUI:        jest.fn()
  }

  const setup = (props = {}) => {
    return render(<SearchFilterDrawer {...defaultProps} {...props} />)
  }

  test("desktop mode renders a FacetDisplay", async () => {
    getViewportWidthMock.mockImplementation(() => 1000)

    setup()

    const facetDisplay = screen.getByTestId("facet-display")
    expect(facetDisplay).toBeInTheDocument()

    expect(screen.queryByText(/filter/i)).not.toBeInTheDocument()
    expect(screen.queryByTestId("layout-buttons-mobile")).not.toBeInTheDocument()
  })

  test("phone mode renders a filter control and layout buttons", async () => {
    getViewportWidthMock.mockImplementation(() => 500)

    setup()

    const filterButton = screen.getByRole("button", { name: /filter/i })
    expect(filterButton).toHaveTextContent("Filter")
    expect(filterButton).toHaveClass("filter-drawer-button")

    const icon = within(filterButton).getByText("arrow_drop_down")
    expect(icon).toBeInTheDocument()

    userEvent.click(filterButton)

    const drawer = screen.getByTestId("facet-display").closest(".search-filter-drawer-open")
    expect(drawer).toBeInTheDocument()

    const applyButton = screen.getByRole("button", { name: /apply filters/i })
    userEvent.click(applyButton)

    expect(screen.queryByTestId("facet-display")).not.toBeInTheDocument()
    expect(screen.getByText(/filter/i)).toBeInTheDocument()

    const layoutButtons = screen.getByRole("button", { name: /show detailed results/i })
    expect(layoutButtons).toBeInTheDocument()
    const compactButton = screen.getByRole("button", { name: /show compact results/i })
    expect(compactButton).toBeInTheDocument()
  })
})
