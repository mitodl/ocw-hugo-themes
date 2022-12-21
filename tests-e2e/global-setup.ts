import * as path from "node:path"
import LocalOCW from "./LocalOcw"

const setupTests = async () => {
  const ocw = new LocalOCW({
    rootDestinationDir: path.resolve("../", "test-sites", "tmp"),
    staticApiPort:      4321
  })

  await ocw.rmrfTmp()
  ocw.staticApiServer.listen()
  await ocw.buildAllSites()
  ocw.serveSites()
  ocw.announceSites()
}

export default setupTests
