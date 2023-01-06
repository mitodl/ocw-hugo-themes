import * as path from "node:path"
import LocalOCW from "../LocalOcw"

interface ExecError extends Error {
  stdout: string
  stderr: string
}

describe("OCW Build Failures", () => {
  const ocw = new LocalOCW({
    rootDestinationDir: path.join(__dirname, "tmp"),
    staticApiPort:      4322
  })

  beforeEach(async () => {
    await ocw.rmrfTmp()
  })
  beforeAll(() => {
    ocw.staticApiServer.listen()
  })
  afterAll(() => {
    ocw.staticApiServer.close()
  })

  afterEach(() => {
    ocw.staticApiServer.resetHandler()
  })

  test.each([
    {
      statusCode: 404,
      match:
        /Failed to fetch course instructors through .* on \/courses\/ocw-ci-test-course/
    },
    {
      statusCode: 504,
      match:      /failed to fetch remote resource: Gateway Timeout/
    }
  ])(
    "Instructor static API errors crash build",
    async ({ statusCode, match }) => {
      const badInstructor = "3caa0884-4fdd-4f3c-ba39-67a64c27d877"
      ocw.staticApiServer.patchHandler((req, res) => {
        if (req.url?.includes(badInstructor)) {
          res.writeHead(statusCode)
          res.end()
        }
      })

      let error: ExecError

      try {
        await ocw.buildSite("course", { execOptions: { stdio: undefined } })
      } catch (err) {
        error = err as ExecError
      }

      expect(error!.stdout).toMatch(match)
    }
  )
})
