import { search } from "./api"

jest.mock("@mitodl/course-search-utils", () => ({
  ...jest.requireActual("@mitodl/course-search-utils"),
  __esModule:       true,
  buildSearchQuery: jest.fn(params => ({ searchFor: params }))
}))

describe("API module", () => {
  beforeEach(() => {
    // @ts-expect-error TODO
    fetch.resetMocks()
  })

  it("should run a search", () => {
    // @ts-expect-error TODO
    fetch.mockResponse(JSON.stringify({}))
    search({ text: "my text!" })
    // @ts-expect-error TODO
    expect(fetch.mock.calls[0]).toEqual([
      process.env.SEARCH_API_URL,
      {
        method: "POST",
        body:   JSON.stringify({
          searchFor: {
            text: "my text!"
          }
        }),
        headers: new Headers({
          "Content-Type": "application/json",
          Accept:         "application/json"
        })
      }
    ])
  })
})
