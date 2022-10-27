import { isApiSuccessful } from "./util"
import { captureException } from "@sentry/browser"
import {
  buildSearchQuery,
  SearchQueryParams
} from "@mitodl/course-search-utils"

export const search = async (params: SearchQueryParams) => {
  // for now
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results: any = {}

  try {
    const body = buildSearchQuery(params)

    const response = await fetch(process.env.SEARCH_API_URL, {
      method:  "POST",
      body:    JSON.stringify(body),
      headers: new Headers({
        "Content-Type": "application/json",
        Accept:         "application/json"
      })
    })

    if (isApiSuccessful(response.status)) {
      results = await response.json()
    } else {
      const additionalData = {
        tags: {
          "search-url":      window.location.href,
          "api-status":      response?.status,
          "api-status-text": response?.statusText
        },
        level: "error",
        extra: { "Search Query Params": JSON.stringify(params) }
      }
      captureException(new Error("Search API failed"), additionalData)
      results["apiFailed"] = true
    }
  } catch (e) {
    captureException(e)
    results["apiFailed"] = true
  }

  return results
}
