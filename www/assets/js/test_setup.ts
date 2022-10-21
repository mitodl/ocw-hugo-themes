// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { enableFetchMocks } from "jest-fetch-mock"
enableFetchMocks()
import Enzyme from "enzyme"
import Adapter from "enzyme-adapter-react-16"

Enzyme.configure({ adapter: new Adapter() })

process.env = {
  ...process.env,
  SEARCH_API_URL:    "http://search-the-planet.example.com/search",
  RESOURCE_BASE_URL: "http://resources-galore.example.com/",
  CDN_PREFIX:        null
}
