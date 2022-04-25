import { buildSearchQuery, SearchQueryParams } from "./search"
import { isApiSuccessful } from "./util"

export const search = async (params: SearchQueryParams) => {
  const body = buildSearchQuery(params)

  const response = await fetch(process.env.SEARCH_API_URL!, {
    method: "POST",
    body: JSON.stringify(body),
    headers: new Headers({
      "Content-Type": "application/json",
      Accept: "application/json"
    })
  })

  let apiSuccessful = false
  let results = {}

  if (isApiSuccessful(response.status)) {
    apiSuccessful = true
    results = await response.json()
  }

  return { results, apiSuccessful }
}
