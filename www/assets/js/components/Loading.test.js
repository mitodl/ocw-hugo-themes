import React from "react"
import { shallow } from "enzyme"

import Loading, { AnimatedEmptyCard, Spinner } from "./Loading"

describe("Loading", () => {
  test("should render ten cards", () => {
    const wrapper = shallow(<Loading />)
    expect(wrapper.find("AnimatedEmptyCard").length).toBe(10)
  })

  test("Card should render what we want", () => {
    const wrapper = shallow(<AnimatedEmptyCard />)

    expect(wrapper.find("Card").prop("className")).toBe("compact-post-summary")
    expect(wrapper.find("ContentLoader")).toBeTruthy()
    expect(wrapper.find("rect").length).toBe(5)
  })

  describe("Spinner", () => {
    test("should render the right divs", () => {
      const wrapper = shallow(<Spinner />)
      expect(wrapper.find(".loading .spinner").exists()).toBeTruthy()
      expect(
        wrapper
          .find(".spinner")
          .children()
          .map(el => el.prop("className"))
      ).toEqual(["bounce1", "bounce2", "bounce3"])
    })

    test("should let you set a className", () => {
      const wrapper = shallow(<Spinner className="not-loading-lol" />)
      expect(wrapper.find(".loading.not-loading-lol").exists()).toBeTruthy()
    })
  })
})
