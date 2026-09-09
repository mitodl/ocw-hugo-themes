import { env, localPort } from "../env"
import LocalOCW, { fromRoot } from "./LocalOcw"
import { FIXTURES_PORT } from "./util/test_sites"

const setupTests = async () => {
  if (env.PLAYWRIGHT_BASE_URL === `http://localhost:${localPort}`) {
    const ocw = new LocalOCW({
      rootDestinationDir: fromRoot("./test-sites/tmp/dist"),
      fixturesPort:       FIXTURES_PORT
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
