import { execFile } from "node:child_process"
import * as fs from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const repoRoot = path.resolve(__dirname, "../..")
const hugoCli = path.join(
  path.dirname(require.resolve("hugo-bin-extended")),
  "bin/cli.js"
)

const youtubeThumbnail = "https://img.youtube.com/vi/abc123/default.jpg"
const archiveUrl = "https://archive.org/download/demo/lecture.mp4"

/**
 * Studio writes v2 paths (/courses/<slug>/...) into front matter. The v3 site
 * is served under /courses/o/<slug>/, so its data.json must map them.
 */
const resources: Record<string, Record<string, unknown>> = {
  document: {
    title:        "Document",
    uid:          "11111111-1111-1111-1111-111111111111",
    resourcetype: "Document",
    file:         "/courses/demo/doc.pdf"
  },
  image: {
    title:          "Course image",
    uid:            "22222222-2222-2222-2222-222222222222",
    resourcetype:   "Image",
    file:           "/courses/demo/course.jpg",
    image_metadata: { "image-alt": "A course image" }
  },
  video: {
    title:        "Video",
    uid:          "33333333-3333-3333-3333-333333333333",
    resourcetype: "Video",
    file:         null,
    video_files:  {
      archive_url:              archiveUrl,
      video_thumbnail_file:     youtubeThumbnail,
      video_captions_file:      "",
      video_transcript_file:    null,
      video_captions_resources: [
        { file: "/courses/demo/captions.vtt", language: "en" },
        { file: "relative_captions.webvtt", language: "es" }
      ],
      video_transcript_resources: [
        { file: "/courses/other-course/transcript.pdf", language: "en" }
      ]
    }
  },
  "legacy-video": {
    title:        "Legacy video",
    uid:          "44444444-4444-4444-4444-444444444444",
    resourcetype: "Video",
    file:         "https://ocw.mit.edu/courses/demo/legacy.mp4",
    video_files:  {
      video_thumbnail_file:  "/courses/demo/thumbnail.jpg",
      video_captions_file:   "/courses/demo/legacy.vtt",
      video_transcript_file: "/courses/o/demo/already-v3.pdf"
    }
  },
  // Studio publishes file paths percent-encoded; the escapes must survive.
  escaped: {
    title:        "Escaped file names",
    uid:          "88888888-8888-8888-8888-888888888888",
    resourcetype: "Video",
    file:         "/courses/demo/scribe%20templates.zip",
    video_files:  {
      video_thumbnail_file:     "/courses/demo/reading%282%29.jpg",
      video_captions_resources: [
        { file: "/courses/demo/lecture%231.vtt", language: "en" },
        { file: "/courses/demo/notes%3Fdraft.vtt", language: "es" },
        { file: "/courses/demo/50%25.vtt", language: "fr" },
        { file: "/courses/demo/a%2Bb.vtt", language: "de" },
        { file: "/courses/demo/a%2Fb.vtt", language: "it" }
      ],
      video_transcript_resources: [
        {
          file:     "https://ocw.mit.edu/courses/demo/a%20b.pdf?q=x%20y#page%202",
          language: "en"
        }
      ]
    }
  },
  odd: {
    title:        "Odd shapes",
    uid:          "55555555-5555-5555-5555-555555555555",
    resourcetype: "Other",
    file:         42,
    video_files:  {
      video_captions_resources:   "not a list",
      video_transcript_resources: ["not a map", { language: "en" }]
    }
  }
}

const frontMatter = (params: Record<string, unknown>) =>
  `---\n${JSON.stringify(params, null, 2)}\n---\n`

const buildSite = async (courseData: Record<string, unknown>) => {
  const source = await fs.mkdtemp(path.join(os.tmpdir(), "ocw-coursedata-v3-"))
  await fs.mkdir(path.join(source, "content/resources"), { recursive: true })
  await fs.mkdir(path.join(source, "content/video_galleries"))
  await fs.mkdir(path.join(source, "content/pages"))
  await fs.mkdir(path.join(source, "data"))
  for (const [name, params] of Object.entries(resources)) {
    await fs.writeFile(
      path.join(source, `content/resources/${name}.md`),
      frontMatter({ content_type: "resource", ...params })
    )
  }
  await fs.writeFile(
    path.join(source, "content/video_galleries/lectures.md"),
    frontMatter({
      title:        "Lectures",
      uid:          "66666666-6666-6666-6666-666666666666",
      content_type: "video_gallery",
      videos:       { content: [resources.video.uid], website: "demo" }
    })
  )
  await fs.writeFile(
    path.join(source, "content/pages/syllabus.md"),
    `${frontMatter({
      title:        "Syllabus",
      uid:          "77777777-7777-7777-7777-777777777777",
      content_type: "page"
    })}Syllabus text.\n`
  )
  await fs.writeFile(
    path.join(source, "data/course.json"),
    JSON.stringify(courseData)
  )
  await fs.writeFile(
    path.join(source, "hugo.json"),
    JSON.stringify({
      baseURL:       "/courses/o/demo/",
      theme:         ["course-v3", "base-theme"],
      themesDir:     repoRoot,
      disableKinds:  ["taxonomy", "term", "RSS", "sitemap", "robotsTXT", "404"],
      // course-v3 ships content for this taxonomy, as configured in production
      taxonomies:    { learning_resource_type: "learning_resource_types" },
      outputFormats: {
        coursedata: {
          mediaType:   "application/json",
          baseName:    "data",
          isPlainText: true
        }
      },
      outputs: {
        home:    ["coursedata"],
        page:    ["coursedata"],
        section: ["coursedata"]
      },
      security: {
        funcs: {
          getenv: ["^HUGO_", "RESOURCE_BASE_URL", "COURSE_V3_CANONICAL_DOMAIN"]
        }
      }
    })
  )

  try {
    await execFileAsync(process.execPath, [hugoCli, "--source", source], {
      env: {
        ...process.env,
        RESOURCE_BASE_URL:          "",
        COURSE_V3_CANONICAL_DOMAIN: "learn.mit.edu"
      }
    })
  } catch (err) {
    await fs.rm(source, { recursive: true, force: true })
    const { stderr, stdout } = err as { stderr?: string; stdout?: string }
    throw new Error(`Hugo build failed:\n${stderr || stdout || err}`)
  }

  const read = async (route: string) =>
    JSON.parse(
      await fs.readFile(path.join(source, "public", route, "data.json"), "utf8")
    )
  return { source, read }
}

const courseData = {
  course_title:  "Demo",
  site_url_path: "courses/demo"
}

describe("course-v3 data.json", () => {
  let site: Awaited<ReturnType<typeof buildSite>>

  beforeAll(async () => {
    site = await buildSite({
      ...courseData,
      course_image: { content: resources.image.uid, website: "demo" }
    })
  }, 60_000)

  afterAll(async () => {
    if (site) await fs.rm(site.source, { recursive: true, force: true })
  })

  test("course root points at the v3 course and its image", async () => {
    const data = await site.read("")
    expect(data.site_url_path).toBe("courses/o/demo")
    expect(data.image_src).toBe("/courses/o/demo/course.jpg")
    expect(data.course_image_metadata.file).toBe("/courses/o/demo/course.jpg")
    expect(data.course_image_metadata.image_metadata).toEqual({
      "image-alt": "A course image"
    })
  })

  test("resource file paths move under /courses/o/", async () => {
    expect((await site.read("resources/document")).file).toBe(
      "/courses/o/demo/doc.pdf"
    )
    expect((await site.read("resources/image")).file).toBe(
      "/courses/o/demo/course.jpg"
    )
  })

  test("video files keep other courses, relative paths and other hosts", async () => {
    const video = await site.read("resources/video")
    expect(video.file).toBeNull()
    expect(video.video_files).toEqual({
      archive_url:              archiveUrl,
      video_thumbnail_file:     youtubeThumbnail,
      video_captions_file:      "",
      video_transcript_file:    null,
      video_captions_resources: [
        { file: "/courses/o/demo/captions.vtt", language: "en" },
        { file: "relative_captions.webvtt", language: "es" }
      ],
      video_transcript_resources: [
        { file: "/courses/o/other-course/transcript.pdf", language: "en" }
      ]
    })
  })

  test("legacy video fields map, and mapping is idempotent", async () => {
    const video = await site.read("resources/legacy-video")
    expect(video.file).toBe("https://learn.mit.edu/courses/o/demo/legacy.mp4")
    expect(video.video_files).toEqual({
      video_thumbnail_file:  "/courses/o/demo/thumbnail.jpg",
      video_captions_file:   "/courses/o/demo/legacy.vtt",
      video_transcript_file: "/courses/o/demo/already-v3.pdf"
    })
  })

  test("file paths keep their percent-encoding", async () => {
    const escaped = await site.read("resources/escaped")
    expect(escaped.file).toBe("/courses/o/demo/scribe%20templates.zip")
    expect(escaped.video_files).toEqual({
      video_thumbnail_file:     "/courses/o/demo/reading%282%29.jpg",
      video_captions_resources: [
        { file: "/courses/o/demo/lecture%231.vtt", language: "en" },
        { file: "/courses/o/demo/notes%3Fdraft.vtt", language: "es" },
        { file: "/courses/o/demo/50%25.vtt", language: "fr" },
        { file: "/courses/o/demo/a%2Bb.vtt", language: "de" },
        { file: "/courses/o/demo/a%2Fb.vtt", language: "it" }
      ],
      video_transcript_resources: [
        {
          file:     "https://learn.mit.edu/courses/o/demo/a%20b.pdf?q=x%20y#page%202",
          language: "en"
        }
      ]
    })
  })

  test("values that are not path strings pass through", async () => {
    const odd = await site.read("resources/odd")
    expect(odd.file).toBe(42)
    expect(odd.video_files).toEqual({
      video_captions_resources:   "not a list",
      video_transcript_resources: ["not a map", { language: "en" }]
    })
  })

  test("video gallery maps the videos it embeds", async () => {
    const gallery = await site.read("video_galleries/lectures")
    expect(gallery.videos).toHaveLength(1)
    expect(gallery.videos[0].video_files.video_captions_resources[0].file).toBe(
      "/courses/o/demo/captions.vtt"
    )
    expect(
      gallery.videos[0].video_files.video_transcript_resources[0].file
    ).toBe("/courses/o/other-course/transcript.pdf")
  })

  test("pages without file fields are unchanged", async () => {
    const page = await site.read("pages/syllabus")
    expect(page.title).toBe("Syllabus")
    expect(page.file).toBeUndefined()
    expect(page.content).toContain("Syllabus text.")
  })
})

test("course root has empty image fields when the course has no image", async () => {
  const site = await buildSite(courseData)
  try {
    const data = await site.read("")
    expect(data.image_src).toBe("")
    expect(data.course_image_metadata.file).toBe("")
    expect(data.site_url_path).toBe("courses/o/demo")
  } finally {
    await fs.rm(site.source, { recursive: true, force: true })
  }
}, 60_000)
