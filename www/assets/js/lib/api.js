import { buildSearchQuery } from "./search"

export const search = async params => {
  const body = buildSearchQuery(params)

  const response = await fetch(process.env.SEARCH_API_URL, {
    method:  "POST",
    body:    JSON.stringify(body),
    headers: new Headers({
      "Content-Type": "application/json",
      Accept:         "application/json"
    })
  })

  const results = await response.json()
  return results
}
