import { localOCWInstance } from "./global-setup"

const teardownTests = async () => {
  localOCWInstance?.teardown()
}

export default teardownTests
