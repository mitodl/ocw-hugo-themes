import { APIRequestContext } from "@playwright/test"
import { test, expect } from "../util/fixtures"
import { siteUrl } from "../util"
import { TestSiteAlias } from "../util/test_sites"

/**
 * Studio writes file paths for the v2 site (/courses/<slug>/...). The v3 site
 * is served under /courses/o/<slug>/, so its data.json must carry that form.
 */
const COURSE = "/courses/o/ocw-ci-test-course/"

/** Rendered HTML, which the page templates already rewrite. */
const RENDERED_KEYS = new Set(["content", "course_description_html"])

const getJson = async (
  request: APIRequestContext,
  siteAlias: TestSiteAlias,
  route: string
) => {
  const response = await request.get(siteUrl(siteAlias, route))
  expect(response.ok(), route).toBeTruthy()
  return response.json()
}

/** Every string value outside rendered HTML, with its key path. */
const authoredStrings = (value: unknown, key = ""): [string, string][] => {
  if (typeof value === "string") return [[key, value]]
  if (Array.isArray(value)) {
    return value.flatMap(item => authoredStrings(item, `${key}[]`))
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) =>
      RENDERED_KEYS.has(k) ? [] : authoredStrings(v, key ? `${key}.${k}` : k)
    )
  }
  return []
}

test.describe("Course v3 data.json", () => {
  test("course root points at the v3 course", async ({
    request,
    siteAlias
  }) => {
    const data = await getJson(request, siteAlias, "data.json")
    expect(data.site_url_path).toBe("courses/o/ocw-ci-test-course")
    expect(data.course_image_metadata.file).toBe(`${COURSE}example_jpg.jpg`)
  })

  test("resource file paths are v3 paths", async ({ request, siteAlias }) => {
    const pdf = await getJson(
      request,
      siteAlias,
      "resources/example_pdf/data.json"
    )
    expect(pdf.file).toBe(`${COURSE}example_pdf.pdf`)
  })

  test("video caption and transcript paths are v3 paths", async ({
    request,
    siteAlias
  }) => {
    const video = await getJson(
      request,
      siteAlias,
      "resources/ocw_test_course_mit8_01f16_l01v01_360p/data.json"
    )
    expect(video.file).toBe(
      `${COURSE}ocw_test_course_mit8_01f16_l01v01_360p_360p_16_9.mp4`
    )
    expect(video.video_files.video_captions_resources).toEqual([
      expect.objectContaining({
        file: `${COURSE}917263bef37857bd94ef67692405bcc9_erlp_sbca1s.vtt`
      })
    ])
    // A transcript stored in another course stays in that course.
    expect(video.video_files.video_transcript_resources).toEqual([
      expect.objectContaining({
        file: "/courses/o/8-01sc-classical-mechanics-fall-2016/33f61131009a6cd12d9a4c0e42eb7f44_ErlP_SBcA1s.pdf"
      })
    ])
    expect(video.video_files.video_thumbnail_file).toBe(
      "https://img.youtube.com/vi/YWyHAlAuRL0/default.jpg"
    )
  })

  test("relative caption and transcript paths are left alone", async ({
    request,
    siteAlias
  }) => {
    const video = await getJson(
      request,
      siteAlias,
      "resources/ocw_test_course_mit8_01f16_l01v02_360p/data.json"
    )
    expect(video.video_files.video_captions_resources[0].file).toBe(
      "ocw_test_course_MIT8_01F16_L01v02_360p.webvtt"
    )
    expect(video.video_files.video_transcript_resources[0].file).toBe(
      "ocw_test_course_MIT8_01F16_L01v02_360p.pdf"
    )
  })

  test("video gallery data.json maps the videos it embeds", async ({
    request,
    siteAlias
  }) => {
    const gallery = await getJson(
      request,
      siteAlias,
      "video_galleries/lecture-videos/data.json"
    )
    expect(gallery.videos.length).toBeGreaterThan(0)
    const files = gallery.videos.map(
      (video: { file: string | null }) => video.file
    )
    expect(files).toContain(
      `${COURSE}ocw_test_course_mit8_01f16_l01v01_360p_360p_16_9.mp4`
    )
  })

  test("no data.json in the course keeps a v2 course path", async ({
    request,
    siteAlias
  }) => {
    const contentMap: Record<string, string> = await getJson(
      request,
      siteAlias,
      "content_map.json"
    )
    const origin = new URL(siteUrl(siteAlias, "")).origin
    const routes = Object.values(contentMap).filter(Boolean)
    expect(routes.length).toBeGreaterThan(20)

    const stale: string[] = []
    for (const route of [...routes, siteUrl(siteAlias, "data.json")]) {
      const response = await request.get(new URL(route, origin).href)
      expect(response.ok(), route).toBeTruthy()
      for (const [key, value] of authoredStrings(await response.json())) {
        if (/^\/courses\/(?!o\/)/.test(value) || value === "None") {
          stale.push(`${route} ${key}: ${value}`)
        }
      }
    }
    expect(stale).toEqual([])
  })
})
