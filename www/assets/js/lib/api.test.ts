import { search } from "./api"
import { FetchMock } from "jest-fetch-mock"

jest.mock("@mitodl/course-search-utils", () => ({
  ...jest.requireActual("@mitodl/course-search-utils"),
  __esModule:       true,
  buildSearchQuery: jest.fn(params => ({ searchFor: params }))
}))

const mockFetch = fetch as FetchMock

describe("API module", () => {
  beforeEach(() => {
    mockFetch.resetMocks()
  })

  it("should run a search", () => {
    mockFetch.mockResponse(JSON.stringify({}))
    search({ text: "my text!" })
    expect(mockFetch.mock.calls[0]).toEqual([
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
