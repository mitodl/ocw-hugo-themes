import { execFile } from "node:child_process"
import * as fs from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { promisify } from "node:util"

// Each test runs a Hugo build, which can outlast Jest's 5 s default when the
// e2e jest files run in parallel on a busy machine.
jest.setTimeout(30_000)

const execFileAsync = promisify(execFile)
const repoRoot = path.resolve(__dirname, "../..")
const hugoCli = path.join(
  path.dirname(require.resolve("hugo-bin-extended")),
  "bin/cli.js"
)

const PAGE_A = "https://ocw.example/courses/test-course/pages/a/"
const PAGE_B = "https://ocw.example/courses/test-course/pages/b/"
/** Page b's own date, from its front matter. Page a has none. */
const PAGE_B_LASTMOD = "2025-03-04T05:06:07-05:00"

/** The base-theme templates a course sitemap renders with, used as they are. */
const SITEMAP_TEMPLATES = [
  "_default/sitemap.xml",
  "partials/site_domain.html",
  "partials/sitemap_domain.html",
  "partials/site_root_url.html"
]

const CUTOVER_DATE_LINE = /(\$cutoverDate := )""/

const readLastmodPartial = (theme: string) =>
  fs.readFile(
    path.join(repoRoot, theme, "layouts/partials/sitemap_lastmod.html"),
    "utf8"
  )

/** course-v2's partial with its cutover date set to `date`. */
const v2PartialWithCutoverDate = async (date: string) => {
  const partial = await readLastmodPartial("course-v2")
  expect(partial).toMatch(CUTOVER_DATE_LINE)
  return partial.replace(CUTOVER_DATE_LINE, `$1"${date}"`)
}

/**
 * Builds a course site with pages a and b, the course sitemap templates and
 * the given sitemap_lastmod.html. Returns each sitemap entry's <lastmod> by
 * its <loc>, or undefined for an entry without one.
 */
const buildSitemap = async (lastmodPartial: string) => {
  const site = await fs.mkdtemp(path.join(os.tmpdir(), "ocw-sitemap-lastmod-"))
  const write = async (file: string, text: string) => {
    await fs.mkdir(path.dirname(path.join(site, file)), { recursive: true })
    await fs.writeFile(path.join(site, file), text)
  }
  try {
    for (const template of SITEMAP_TEMPLATES) {
      await write(
        `layouts/${template}`,
        await fs.readFile(
          path.join(repoRoot, "base-theme/layouts", template),
          "utf8"
        )
      )
    }
    await write("layouts/partials/sitemap_lastmod.html", lastmodPartial)
    await write("layouts/_default/single.html", "{{ .Title }}")
    await write("layouts/_default/list.html", "{{ .Title }}")
    await write("content/pages/a.md", "---\ntitle: A\n---\n")
    await write(
      "content/pages/b.md",
      `---\ntitle: B\nlastmod: ${PAGE_B_LASTMOD}\n---\n`
    )
    await write(
      "hugo.json",
      JSON.stringify({
        baseURL:      "/courses/test-course/",
        disableKinds: ["taxonomy", "term", "RSS"],
        security:     { funcs: { getenv: ["^HUGO_", "SITEMAP_DOMAIN"] } }
      })
    )

    try {
      await execFileAsync(process.execPath, [hugoCli, "--source", site], {
        env: { ...process.env, SITEMAP_DOMAIN: "ocw.example" }
      })
    } catch (error) {
      // Hugo prints build errors on stdout, which execFile leaves out of its message
      const { stdout, stderr } = error as { stdout: string; stderr: string }
      throw new Error(`Hugo build failed:\n${stdout}${stderr}`)
    }

    const sitemap = await fs.readFile(
      path.join(site, "public/sitemap.xml"),
      "utf8"
    )
    const entries = sitemap.matchAll(
      /<url>\s*<loc>(.*?)<\/loc>(?:\s*<lastmod>(.*?)<\/lastmod>)?/g
    )
    return new Map([...entries].map(([, loc, lastmod]) => [loc, lastmod]))
  } finally {
    await fs.rm(site, { recursive: true, force: true })
  }
}

test.each(["base-theme", "course-v2"])(
  "%s sitemap prints a page's own date, and none for an undated page",
  async theme => {
    const lastmods = await buildSitemap(await readLastmodPartial(theme))

    expect(lastmods.has(PAGE_A)).toBe(true)
    expect(lastmods.get(PAGE_A)).toBeUndefined()
    expect(lastmods.get(PAGE_B)).toBe(PAGE_B_LASTMOD)
  }
)

test("course-v2 sitemap puts the cutover date on every entry", async () => {
  const lastmods = await buildSitemap(
    await v2PartialWithCutoverDate("2026-01-02")
  )

  expect([...lastmods.keys()]).toEqual(expect.arrayContaining([PAGE_A, PAGE_B]))
  expect(new Set(lastmods.values())).toEqual(new Set(["2026-01-02"]))
})

test("a mistyped cutover date fails the course-v2 build", async () => {
  const partial = await v2PartialWithCutoverDate("not-a-date")

  await expect(buildSitemap(partial)).rejects.toThrow(/not-a-date/)
})
