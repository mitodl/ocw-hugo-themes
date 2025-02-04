import * as path from "node:path"
import { IncomingMessage } from "node:http"
import LocalOCW from "../LocalOcw"
import { TestSiteAlias } from "../util/test_sites"
jest.setTimeout(1000000)
interface ExecError extends Error {
  stdout: string
  stderr: string
}

const expectBuildError = async (
  ocw: LocalOCW,
  alias: TestSiteAlias,
  messages: (string | RegExp)[]
) => {
  let error: ExecError

  try {
    await ocw.buildSite(alias, { execOptions: { stdio: undefined } })
  } catch (err) {
    error = err as ExecError
  }

  messages.forEach(msg => {
    expect(error!.stdout).toMatch(msg)
  })
}

describe("OCW Build Failures", () => {
  const ocw = new LocalOCW({
    rootDestinationDir: path.join(__dirname, "tmp"),
    fixturesPort:       4322
  })

  beforeEach(async () => {
    await ocw.rmrfTmp()
  })
  beforeAll(() => {
    ocw.fixturesServer.listen()
  })
  afterAll(() => {
    ocw.fixturesServer.close()
  })

  afterEach(() => {
    ocw.fixturesServer.resetHandler()
  })

  test.each([
    {
      statusCode: 404,
      match:      [/Failed to fetch instructors/, /from .*4322\/instructors/]
    },
    {
      statusCode: 504,
      match:      [
        /Failed to fetch instructors/,
        /from .*4322\/instructors/,
        /with error.* Gateway Timeout/
      ]
    }
  ])(
    "Instructor static API errors crash build",
    async ({ statusCode, match }) => {
      const shouldPatch = (req: IncomingMessage) =>
        req.url?.includes("3caa0884-4fdd-4f3c-ba39-67a64c27d877")
      ocw.fixturesServer.patchHandler((req, res) => {
        if (shouldPatch(req)) {
          res.writeHead(statusCode)
          res.end()
        }
      })

      await expectBuildError(ocw, "course", match)
    }
  )

  test.each([
    {
      statusCode: 404,
      match:      [
        /Failed to fetch featured course info/,
        /from .*4322\/courses\/some-featured-course/
      ]
    },
    {
      statusCode: 504,
      match: [
        /ERROR Retry timeout/,
      ]
    }
  ])("Featured course static API failures", async ({ statusCode, match }) => {
    const shouldPatch = (req: IncomingMessage) =>
      req.url?.includes("some-featured-course")
    ocw.fixturesServer.patchHandler((req, res) => {
      if (shouldPatch(req)) {
        res.writeHead(statusCode)
        res.end()
      }
    })

    await expectBuildError(ocw, "www", match)
  })

  test.each([
    {
      statusCode: 404,
      match:      [/Failed to fetch new course info/]
    },
    {
      statusCode: 504,
      match:      [
        /Failed to fetch new course info/,
        /from .*4322\/courses\/some-new-course.*/,
        /with error.* Gateway Timeout/
      ]
    }
  ])("Featured course static API failures", async ({ statusCode, match }) => {
    const shouldPatch = (req: IncomingMessage) =>
      req.url?.includes("some-new-course")
    ocw.fixturesServer.patchHandler((req, res) => {
      if (shouldPatch(req)) {
        res.writeHead(statusCode)
        res.end()
      }
    })

    await expectBuildError(ocw, "www", match)
  })
})
