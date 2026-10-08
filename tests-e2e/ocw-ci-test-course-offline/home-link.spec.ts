import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { pathToFileURL } from "node:url"
import { Page, test, expect } from "@playwright/test"
import { fromRoot } from "../LocalOcw"
import { offlineV2SiteDir } from "../util/offline-build"

/**
 * file://-only: one offline build ships twice, as the course download zip and,
 * synced to the course's site_url_path, inside the mirror drive. The OCW logo
 * has to lead somewhere that exists in both. See
 * course-offline/assets/js/mirror_home_link.ts.
 */

const { site_url_path: siteUrlPath, site_short_id: siteShortId } = JSON.parse(
  fs.readFileSync(
    fromRoot("./test-sites/ocw-ci-test-course/data/course.json"),
    "utf8"
  )
)

const logoLinks = (page: Page) => page.locator("a.ocw-logo-link")

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
 * Copies the offline build to `relDir` under the temp root and opens its
 * syllabus page from disk. Returns the course directory.
 */
const openSyllabusFrom = async (page: Page, relDir: string) => {
  const courseDir = path.join(tmpRoot, relDir)
  fs.cpSync(offlineV2SiteDir, courseDir, { recursive: true })
  await page.goto(
    pathToFileURL(path.join(courseDir, "pages", "syllabus", "index.html")).href
  )
  return courseDir
}

const expectLogoLinksTo = async (page: Page, href: string) => {
  const links = logoLinks(page)
  await expect(links).toHaveCount(2)
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", href)
  }
}

test("In a downloaded zip, the logo links to the course home", async ({
  page
}) => {
  // <short_id>.zip extracts into a folder of the same name.
  const courseDir = await openSyllabusFrom(page, siteShortId)
  await expectLogoLinksTo(page, "../../index.html")

  await page.locator("#desktop-header a.ocw-logo-link").click()
  await expect(page).toHaveURL(
    pathToFileURL(path.join(courseDir, "index.html")).href
  )
})

test("Inside a mirror drive, the logo links to the mirror home", async ({
  page
}) => {
  fs.writeFileSync(
    path.join(tmpRoot, "index.html"),
    "<!doctype html><title>Mirror home</title>"
  )
  await openSyllabusFrom(page, siteUrlPath)
  const mirrorHome = pathToFileURL(path.join(tmpRoot, "index.html")).href
  await expectLogoLinksTo(page, mirrorHome)

  await page.locator("#desktop-header a.ocw-logo-link").click()
  await expect(page).toHaveURL(mirrorHome)
})
