import { slugify } from "./util"

describe("util tests", () => {
  it("slugify should, well, slugify things", () => {
    [
      ["foo Bar baz", "foo-bar-baz"],
      ["foo_bar-baz", "foo-bar-baz"],
      ["foo_bar-baz", "foo-bar-baz"],
      ["foo BAR BaZ", "foo-bar-baz"],
      ["foo\\BAR)BaZ", "foo-bar-baz"],
      ["foo\\BAR]BaZ", "foo-bar-baz"]
    ].forEach(([input, exp]) => {
      expect(slugify(input)).toEqual(exp)
    })
  })
})
