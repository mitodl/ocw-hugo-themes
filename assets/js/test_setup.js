import "@babel/polyfill"
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

Object.defineProperty(window, "location", {
  // this is a hack just to be able to assert in tests that window.location
  // has been set to a value
  set: value => {
    if (!value.startsWith("http")) {
      value = `http://fake${value}`
    }
    window._URL = value
  },

  get: () => {
    if (window._location) {
      return window._location
    } else {
      const location = new Location()
      window._location = location
      return location
    }
  }
})

process.env = {
  ...process.env,
  SEARCH_API_URL: "http://search-the-planet.example.com/search",
  CDN_PREFIX:     null
}
