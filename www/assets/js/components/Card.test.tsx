import { render } from "@testing-library/react"

import Card from "./Card"

describe("Card component", () => {
  test("should render children", () => {
    const { getByTestId } = render(
      <Card>
        <div data-testid="test-div" className="test-div">
          Test Content
        </div>
      </Card>
    )
    expect(getByTestId("test-div")).toBeInTheDocument()
  })

  test("should have a className", () => {
    const { container } = render(<Card className="extra-class-name" />)
    expect(container.firstChild).toHaveClass("card", "extra-class-name")
  })

  test("should pass data-testid attribute to the card element", () => {
    const { container } = render(<Card data-testid="course-list-row" />)
    expect(container.firstChild).toHaveAttribute(
      "data-testid",
      "course-list-row"
    )
  })
})
