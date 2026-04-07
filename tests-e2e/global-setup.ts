import { env, localPort } from "../env"
import LocalOCW, { fromRoot } from "./LocalOcw"
import { buildOfflineV3Site } from "./util"

const setupTests = async () => {
  // Build the offline-v3 site once before any Playwright worker starts so
  // that concurrent spec beforeAll hooks can skip the Hugo invocation.
  await buildOfflineV3Site()

  if (env.PLAYWRIGHT_BASE_URL === `http://localhost:${localPort}`) {
    const ocw = new LocalOCW({
      rootDestinationDir: fromRoot("./test-sites/tmp/dist"),
      fixturesPort:       4321
    })

    await ocw.rmrfTmp()
    await ocw.fixturesServer.listen()
    await ocw.buildAllSites()
    ocw.serveSites()
    ocw.announceSites()

    return () => ocw.teardown()
  }
}

export default setupTests
