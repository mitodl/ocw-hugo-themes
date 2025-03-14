import { enableFetchMocks } from "jest-fetch-mock"
enableFetchMocks()

process.env = {
  ...process.env,
  SEARCH_API_URL:    "http://search-the-planet.example.com/search",
  RESOURCE_BASE_URL: "http://resources-galore.example.com/",
  // @ts-expect-error We should consider not doing this. NodeJS will always return strings from process.env
  CDN_PREFIX:        null
}
