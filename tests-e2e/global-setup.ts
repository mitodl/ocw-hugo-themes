import LocalOCW, { fromRoot } from "./LocalOcw"

const setupTests = async () => {
  const ocw = new LocalOCW({
    rootDestinationDir: fromRoot("./test-sites/tmp/dist"),
    staticApiPort:      4321
  })

  await ocw.rmrfTmp()
  ocw.staticApiServer.listen()
  await ocw.buildAllSites()
  ocw.serveSites()
  ocw.announceSites()
}

export default setupTests
