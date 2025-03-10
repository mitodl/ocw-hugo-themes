import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SearchBox, { SearchBoxProps } from "./SearchBox"

describe("SearchBox component", () => {
  const setup = (props: SearchBoxProps) => render(<SearchBox {...props} />)

  test("should pass value, onChange to <input> and onSubmit to <form>", async () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn(e => e.preventDefault())
    const value = "value"

    setup({ onChange, value, onSubmit })

    const input = screen.getByPlaceholderText("Search OpenCourseWare")
    expect(input).toHaveValue(value)
    expect(input).toHaveAttribute("type", "search")

    await userEvent.clear(input)
    await userEvent.type(input, "new value")
    expect(onChange).toHaveBeenCalled()

    const form = screen.getByRole("search")
    expect(form).toBeInTheDocument()

    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("type", "submit")

    fireEvent.submit(form)
    expect(onSubmit).toHaveBeenCalled()
  })
})
