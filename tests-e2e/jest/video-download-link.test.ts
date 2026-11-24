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
const archiveUrl = "https://archive.example/video.mp4"
const videos = {
  bundled: {
    file:           "https://files.example/course/bundled.mp4",
    video_files:    { archive_url: archiveUrl },
    video_metadata: { youtube_id: "test-video" }
  },
  missing: {
    file:           "/course/missing.mp4",
    video_files:    { archive_url: archiveUrl },
    video_metadata: { youtube_id: "missing-video" }
  },
  unavailable: { file: "/course/missing.mp4" },
  archive:     { video_files: { archive_url: archiveUrl } },
  empty:       {}
}

test.each([true, false])(
  "offline video links reflect the packaged files (bundle present: %s)",
  async hasBundle => {
    const source = await fs.mkdtemp(path.join(os.tmpdir(), "ocw-video-links-"))
    try {
      await fs.mkdir(path.join(source, "layouts"))
      await fs.writeFile(
        path.join(source, "layouts/index.json"),
        `{{- $links := dict -}}
{{- range $name, $params := site.Params.videos -}}
  {{- $resource := dict "Params" $params "RelPermalink" "/courses/offline/resources/video/" -}}
  {{- $download := partial "get_video_download_link.html" (dict "context" $resource "resource" $resource) -}}
  {{- $watch := partial "video_youtube_link.html" (dict "context" $resource "downloadLink" $download) -}}
  {{- $links = merge $links (dict $name (dict
    "download" $download
    "watch" (in $watch "Watch on YouTube"))) -}}
{{- end -}}
{{- $links | jsonify -}}`
      )
      await fs.writeFile(
        path.join(source, "hugo.json"),
        JSON.stringify({
          baseURL:      "https://example.test/courses/offline/",
          outputs:      { home: ["JSON"] },
          disableKinds: ["taxonomy", "term", "RSS", "sitemap"],
          params:       { videos },
          module:       {
            mounts: [
              { source: "content", target: "content" },
              { source: "layouts", target: "layouts" },
              {
                source: path.join(repoRoot, "base-offline/layouts/partials"),
                target: "layouts/partials"
              },
              {
                source:       path.join(repoRoot, "base-theme/layouts/partials"),
                target:       "layouts/partials",
                includeFiles: "video_youtube_link_classes.html"
              }
            ]
          }
        })
      )
      if (hasBundle) {
        const bundle = path.join(source, "content/static_resources")
        await fs.mkdir(bundle, { recursive: true })
        await fs.writeFile(
          path.join(bundle, "index.md"),
          "---\nheadless: true\n---\n"
        )
        await fs.writeFile(path.join(bundle, "bundled.mp4"), "bundled video")
      }

      await execFileAsync(process.execPath, [hugoCli, "--source", source])

      const links = JSON.parse(
        await fs.readFile(path.join(source, "public/index.json"), "utf8")
      )
      expect(links).toEqual({
        bundled: {
          download: hasBundle ?
            "../../static_resources/bundled.mp4" :
            archiveUrl,
          watch: !hasBundle
        },
        missing:     { download: archiveUrl, watch: true },
        unavailable: { download: "", watch: false },
        archive:     { download: archiveUrl, watch: false },
        empty:       { download: "", watch: false }
      })
      if (hasBundle) {
        expect(
          await fs.readFile(
            path.join(source, "public/static_resources/bundled.mp4"),
            "utf8"
          )
        ).toBe("bundled video")
      }
    } finally {
      await fs.rm(source, { recursive: true, force: true })
    }
  }
)
