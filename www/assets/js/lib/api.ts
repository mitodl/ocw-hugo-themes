import { buildSearchQuery, SearchQueryParams } from "./search"
import {
  isApiSuccessful,
  sentryCaptureException,
  sentryCaptureMessage
} from "./util"

export const search = async (params: SearchQueryParams) => {
  let results: any = {}

  try {
    const body = buildSearchQuery(params)

    const response = await fetch(process.env.SEARCH_API_URL!, {
      method: "POST",
      body: JSON.stringify(body),
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json"
      })
    })

    if (isApiSuccessful(response.status)) {
      results = await response.json()
    } else {
      sentryCaptureMessage(
        `Something went wrong in the search API. Query Details: ${JSON.stringify(
          params
        )}`
      )
      results["apiFailed"] = true
    }
  } catch (e) {
    sentryCaptureException(e)
    results["apiFailed"] = true
  }

  return results
}
