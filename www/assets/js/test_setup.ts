import { enableFetchMocks } from "jest-fetch-mock"
enableFetchMocks()
import Enzyme from "enzyme"
import Adapter from "enzyme-adapter-react-16"

// Add this at the top of your test file or in a setup file
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

Enzyme.configure({ adapter: new Adapter() })

process.env = {
  ...process.env,
  SEARCH_API_URL:    "http://search-the-planet.example.com/search",
  RESOURCE_BASE_URL: "http://resources-galore.example.com/",
  // @ts-expect-error We should consider not doing this. NodeJS will always return strings from process.env
  CDN_PREFIX:        null
}
