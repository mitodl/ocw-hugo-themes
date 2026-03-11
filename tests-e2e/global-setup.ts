import { env, localPort } from "../env"
import LocalOCW, { fromRoot } from "./LocalOcw"

export let localOCWInstance: LocalOCW | null = null

const setupTests = async () => {
  if (env.PLAYWRIGHT_BASE_URL === `http://localhost:${localPort}`) {
    const ocw = new LocalOCW({
      rootDestinationDir: fromRoot("./test-sites/tmp/dist"),
      fixturesPort:       4321
    })
    localOCWInstance = ocw

    await ocw.rmrfTmp()
    ocw.fixturesServer.listen()
    await ocw.buildAllSites()
    ocw.serveSites()
    ocw.announceSites()
  }
}

export default setupTests
