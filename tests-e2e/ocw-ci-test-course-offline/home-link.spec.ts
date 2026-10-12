import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { pathToFileURL } from "node:url"
import { Page, test, expect } from "@playwright/test"
import { fromRoot } from "../LocalOcw"
import { offlineV2SiteDir } from "../util/offline-build"
import { FIXTURES_PORT } from "../util/test_sites"

/**
 * file://-only: one offline build ships twice, synced to the course's
 * site_url_path inside the mirror drive and as the course download zip. The
 * OCW logo leads to the mirror home, which only exists in the mirror, so a zip
 * falls back to the live site. The course title always leads to the course
 * home. See course-offline/assets/js/mirror_home_link.ts.
 */

const { site_url_path: siteUrlPath, site_short_id: siteShortId } = JSON.parse(
  fs.readFileSync(
    fromRoot("./test-sites/ocw-ci-test-course/data/course.json"),
    "utf8"
  )
)

/** The live site URL, from the STATIC_API_BASE_URL that LocalOcw builds with. */
const LIVE_SITE_URL = `http://localhost:${FIXTURES_PORT}/`

const logoLinks = (page: Page) => page.locator("a.ocw-logo-link")
const courseTitleLink = (page: Page) => page.locator("#course-banner h1 a")

let tmpRoot: string

test.beforeEach(() => {
  tmpRoot = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), "ocw-offline-"))
  )
})

test.afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true })
})

/**
 * Copies the offline build to `relDir` under the temp root, opens its syllabus
 * page from disk and waits for the course bundle to run. Returns the course
 * directory.
 */
const openSyllabusFrom = async (page: Page, relDir: string) => {
  const courseDir = path.join(tmpRoot, relDir)
  fs.cpSync(offlineV2SiteDir, courseDir, { recursive: true })
  await page.goto(
    pathToFileURL(path.join(courseDir, "pages", "syllabus", "index.html")).href
  )
  // Set in the same ready callback, just before initMirrorHomeLinks runs.
  await page.waitForFunction(() => "videojs" in window)
  return courseDir
}

const expectCourseTitleLinksTo = async (page: Page, courseDir: string) => {
  expect(
    await courseTitleLink(page).evaluate((link: HTMLAnchorElement) => link.href)
  ).toBe(pathToFileURL(path.join(courseDir, "index.html")).href)
}

test("In a downloaded zip, the logo links to the live site", async ({
  page
}) => {
  // <short_id>.zip extracts into a folder of the same name.
  const courseDir = await openSyllabusFrom(page, siteShortId)

  const links = logoLinks(page)
  await expect(links).toHaveCount(2)
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", LIVE_SITE_URL)
  }
  await expectCourseTitleLinksTo(page, courseDir)
})

test("Inside a mirror drive, the logo links to the mirror home", async ({
  page
}) => {
  fs.writeFileSync(
    path.join(tmpRoot, "index.html"),
    "<!doctype html><title>Mirror home</title>"
  )
  const courseDir = await openSyllabusFrom(page, siteUrlPath)
  const mirrorHome = pathToFileURL(path.join(tmpRoot, "index.html")).href

  const links = logoLinks(page)
  await expect(links).toHaveCount(2)
  for (const link of await links.all()) {
    // relative, so it works wherever the mirror is mounted
    expect(await link.getAttribute("href")).toMatch(/^\.\.?\//)
    expect(
      await link.evaluate((anchor: HTMLAnchorElement) => anchor.href)
    ).toBe(mirrorHome)
  }
  await expectCourseTitleLinksTo(page, courseDir)

  await page.locator("#desktop-header a.ocw-logo-link").click()
  await expect(page).toHaveURL(mirrorHome)
})
