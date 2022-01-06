import { search } from "./api"

jest.mock("./search", () => ({
  __esModule:       true,
  buildSearchQuery: jest.fn(params => ({ searchFor: params }))
}))

describe("API module", () => {
  beforeEach(() => {
    // @ts-ignore
    fetch.resetMocks()
  })

  it("should run a search", () => {
    // @ts-ignore
    fetch.mockResponse(JSON.stringify({}))
    search({ text: "my text!" })
    // @ts-ignore
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
