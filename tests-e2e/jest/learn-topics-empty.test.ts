import * as fs from "node:fs"
import * as path from "node:path"
import LocalOCW, { fromRoot } from "../LocalOcw"
import { TEST_SITES } from "../util/test_sites"

/**
 * Course v2's MIT Learn copy lists `mit_learn_topics` and leaves the Topics
 * section out when a course has none (course-v2/layouts/partials/topics.html).
 * The shared test course has Learn topics, so this builds a copy of it with an
 * empty list.
 */
describe("Learn copy of a course with no mit_learn_topics", () => {
  // Not tests-e2e/jest/tmp, which build-failures.test.ts deletes while jest
  // runs test files in parallel. It has to be inside the repo, because the
  // build runs `yarn hugo` from the content directory.
  const tmpRoot = fromRoot("./test-sites/tmp")
  fs.mkdirSync(tmpRoot, { recursive: true })
  const workDir = fs.mkdtempSync(path.join(tmpRoot, "learn-topics-empty-"))
  const contentDir = path.join(workDir, "content")
  const destinationDir = path.join(workDir, "dist")
  const ocw = new LocalOCW({
    rootDestinationDir: destinationDir,
    fixturesPort:       4323
  })

  beforeAll(async () => {
    fs.cpSync(fromRoot("./test-sites/ocw-ci-test-course"), contentDir, {
      recursive: true
    })
    const dataFile = path.join(contentDir, "data", "course.json")
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"))
    fs.writeFileSync(
      dataFile,
      JSON.stringify({ ...data, mit_learn_topics: [] })
    )

    await ocw.fixturesServer.listen()
    await ocw.buildSite("course", { contentDir })
  }, 60_000)

  afterAll(() => {
    ocw.fixturesServer.close()
    fs.rmSync(workDir, { recursive: true, force: true })
  })

  const builtPage = (route: string) => {
    const file = path.join(
      destinationDir,
      TEST_SITES.course.basePath,
      route,
      "index.html"
    )
    return new DOMParser().parseFromString(
      fs.readFileSync(file, "utf8"),
      "text/html"
    )
  }

  const topicsHeadings = (copies: Element[]) =>
    copies.flatMap(copy =>
      Array.from(copy.querySelectorAll("h3")).filter(
        heading => heading.textContent?.trim() === "Topics"
      )
    )

  const copies = (document: Document, variant: "ocw" | "learn") =>
    Array.from(document.querySelectorAll(`[data-search-variant="${variant}"]`))

  test("the home page's Learn copy has no Topics section", () => {
    const document = builtPage("")
    const home = (variant: string) =>
      Array.from(
        document.querySelectorAll(
          `.course-detail-section > [data-search-variant="${variant}"]`
        )
      )
    expect(topicsHeadings(home("learn"))).toHaveLength(0)
    expect(topicsHeadings(home("ocw"))).toHaveLength(1)
  })

  test("the home page's Learn copy leaves out the empty Topics column", () => {
    // An empty column would keep its inner .mt-4 margin, a blank gap under
    // the course info on phones, where the columns stack.
    const document = builtPage("")
    const columns = (variant: string) =>
      document.querySelectorAll(
        `.course-detail-section > [data-search-variant="${variant}"] .row > .col-sm-6`
      )
    expect(columns("learn")).toHaveLength(1)
    expect(columns("ocw")).toHaveLength(2)
  })

  test("the drawers' Learn copies have no Topics section", () => {
    const document = builtPage("pages/section-1")
    expect(topicsHeadings(copies(document, "learn"))).toHaveLength(0)
    // One OCW Topics section in each drawer.
    expect(topicsHeadings(copies(document, "ocw"))).toHaveLength(2)
  })
})
