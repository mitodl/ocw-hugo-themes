import { env, localPort } from "../env"
import LocalOCW, { fromRoot } from "./LocalOcw"

const setupTests = async () => {
  if (env.PLAYWRIGHT_BASE_URL === `http://localhost:${localPort}`) {
    const ocw = new LocalOCW({
      rootDestinationDir: fromRoot("./test-sites/tmp/dist"),
      fixturesPort:       4321
    })

    await ocw.rmrfTmp()
    await ocw.fixturesServer.listen()
    // Build the offline-v3 site once with the fixtures server running so
    // that Hugo can reach localhost:4321 for instructor JSON. Concurrent
    // spec beforeAll hooks will skip the Hugo invocation (index.html exists).
    // await ocw.buildSite("course-v3-offline")
    await ocw.buildAllSites()
    ocw.serveSites()
    ocw.announceSites()

    return () => ocw.teardown()
  }
}

export default setupTests
