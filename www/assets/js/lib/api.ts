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

  let results: any = {}
  if (isApiSuccessful(response.status)) {
    results = await response.json()
  } else {
    results["apiFailed"] = true
  }

  return results
}
