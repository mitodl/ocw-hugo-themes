import * as path from "node:path"
import { IncomingMessage } from "node:http"
import LocalOCW from "../LocalOCW"
import { TestSiteAlias } from "../util/test_sites"

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

  describe("Instructor static API errors crash build", () => {
    const patchInstructorRequest = (responder: (attempt: number) => number) => {
      let attempt = 0
      const shouldPatch = (req: IncomingMessage) =>
        req.url?.includes("3caa0884-4fdd-4f3c-ba39-67a64c27d877")
      ocw.fixturesServer.patchHandler((req, res) => {
        if (shouldPatch(req)) {
          attempt++
          const statusCode = responder(attempt)
          res.writeHead(statusCode)
          res.end()
        }
      })
    }

    test("should return 504 on the first request then 404 for subsequent requests", async () => {
      patchInstructorRequest(attempt => (attempt === 1 ? 504 : 404))

      await expectBuildError(ocw, "course", [
        /Failed to fetch instructors/,
        /from .*4322\/instructors/
      ])
    })
  })

  describe("Featured course static API failures for featured course", () => {
    const patchFeaturedCourseRequest = (
      responder: (attempt: number) => number
    ) => {
      let attempt = 0
      const shouldPatch = (req: IncomingMessage) =>
        req.url?.includes("some-featured-course")
      ocw.fixturesServer.patchHandler((req, res) => {
        if (shouldPatch(req)) {
          attempt++
          const statusCode = responder(attempt)
          res.writeHead(statusCode)
          res.end()
        }
      })
    }

    test("should return 504 on the first request then 404 for subsequent requests", async () => {
      patchFeaturedCourseRequest(attempt => (attempt === 1 ? 504 : 404))

      await expectBuildError(ocw, "www", [
        /Failed to fetch featured course info/,
        /from .*4322\/courses\/some-featured-course/
      ])
    })
  })

  describe("Featured course static API failures for new course", () => {
    const patchNewCourseRequest = (responder: (attempt: number) => number) => {
      let attempt = 0
      const shouldPatch = (req: IncomingMessage) =>
        req.url?.includes("some-new-course")
      ocw.fixturesServer.patchHandler((req, res) => {
        if (shouldPatch(req)) {
          attempt++
          const statusCode = responder(attempt)
          res.writeHead(statusCode)
          res.end()
        }
      })
    }

    test("should return 504 on the first request then 404 for subsequent requests", async () => {
      patchNewCourseRequest(attempt => (attempt === 1 ? 504 : 404))

      await expectBuildError(ocw, "www", [
        /Failed to fetch new course info/,
        /from .*4322\/courses\/some-new-course.*/
      ])
    })
  })
})
