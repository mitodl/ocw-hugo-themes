import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { pathToFileURL } from "node:url"
import { Page, test, expect } from "@playwright/test"
import { fromRoot } from "../LocalOcw"
import { offlineV2FileUrl, offlineV2SiteDir } from "../util/offline-build"

/**
 * file://-only: one offline build ships twice, as the course download zip and,
 * synced to the course's site_url_path, inside the mirror drive. The OCW logo
 * has to lead somewhere that exists in both. See
 * course-offline/assets/js/mirror_home_link.ts.
 */

const logoLinks = (page: Page) => page.locator("a.ocw-logo-link")

test("Logo links to the course home, not the live site", async ({ page }) => {
  await page.goto(offlineV2FileUrl("/pages/syllabus"))
  const links = logoLinks(page)
  await expect(links).toHaveCount(2)
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("href", "../../index.html")
  }
})

test.describe("Inside a mirror drive", () => {
  const { site_url_path: siteUrlPath } = JSON.parse(
    fs.readFileSync(
      fromRoot("./test-sites/ocw-ci-test-course/data/course.json"),
      "utf8"
    )
  )
  let mirrorRoot: string

  test.beforeAll(() => {
    mirrorRoot = fs.realpathSync(
      fs.mkdtempSync(path.join(os.tmpdir(), "ocw-mirror-"))
    )
    fs.writeFileSync(
      path.join(mirrorRoot, "index.html"),
      "<!doctype html><title>Mirror home</title>"
    )
    fs.cpSync(offlineV2SiteDir, path.join(mirrorRoot, siteUrlPath), {
      recursive: true
    })
  })

  test.afterAll(() => {
    fs.rmSync(mirrorRoot, { recursive: true, force: true })
  })

  test("Logo links to the mirror home page", async ({ page }) => {
    const mirrorHome = pathToFileURL(path.join(mirrorRoot, "index.html")).href
    await page.goto(
      pathToFileURL(
        path.join(mirrorRoot, siteUrlPath, "pages", "syllabus", "index.html")
      ).href
    )
    const links = logoLinks(page)
    await expect(links).toHaveCount(2)
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute("href", mirrorHome)
    }

    await page.locator("#desktop-header a.ocw-logo-link").click()
    await expect(page).toHaveURL(mirrorHome)
  })
})
