import React from "react"
import { shallow } from "enzyme"

import Card from "./Card"

describe("Card component", () => {
  test("should render children", () => {
    const wrapper = shallow(
      <Card>
        <div className="test-div" />
      </Card>
    )
    expect(wrapper.find(".test-div").exists()).toBeTruthy()
  })

  test("should have a className", () => {
    const wrapper = shallow(<Card className="extra-class-name" />)
    expect(wrapper.prop("className")).toBe("card extra-class-name")
  })
})
