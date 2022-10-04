// @ts-nocheck
import Enzyme from "enzyme"
import Adapter from "enzyme-adapter-react-16"

require("jest-fetch-mock").enableMocks()

Enzyme.configure({ adapter: new Adapter() })

class Location {
  constructor() {
    this.href = ""
    this.search = ""
  }
}

process.env = {
  ...process.env,
  SEARCH_API_URL:    "http://search-the-planet.example.com/search",
  RESOURCE_BASE_URL: "http://resources-galore.example.com/",
  CDN_PREFIX:        null
}
