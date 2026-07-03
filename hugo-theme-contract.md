# Hugo Theme Contract — Multi-Language Captions & Transcripts

## Scope

This document defines the data contract that OCW Hugo themes (`ocw-course-v2` and `ocw-course-v3`) must implement to render multiple caption tracks and multiple transcript download links under the video player.  It is addressed to theme developers.  Studio produces the data; themes consume it.

---

## 1. Front-Matter Format

Every video resource YAML front-matter file contains a `video_files` object.  `video_captions_resources` and `video_transcript_resources` are **arrays of objects**, not strings — this is the sole caption/transcript field; there is no separate `_file` field.

```yaml
# content/resources/lecture1_video.md
---
uid: abc123-…
title: "Lecture 1: Introduction"
content_type: video_resource
video_files:
  video_captions_resources:
    - file: /courses/8-01sc-physics-i/resources/lecture1_captions_vtt
      language: en
    - file: /courses/8-01sc-physics-i/resources/lecture1_captions_fr_vtt
      language: fr
    - file: /courses/8-01sc-physics-i/resources/lecture1_captions_zh_vtt
      language: zh
  video_transcript_resources:
    - file: /courses/8-01sc-physics-i/resources/lecture1_transcript_pdf
      language: en
    - file: /courses/8-01sc-physics-i/resources/lecture1_transcript_fr_pdf
      language: fr
  video_thumbnail_file: null
video_metadata:
  youtube_id: dQw4w9WgXcQ
---
```

### Studio-side vs. built-frontmatter shape

In Studio's CMS, `video_captions_resources`/`video_transcript_resources` are relation-widget fields storing `{"content": [text_id, ...], "website": name}` — a list of content IDs, not resolved file paths. At git-sync time, Studio's `full_metadata()` **resolves** this relation into the array shown above (`[{"file": ..., "language": ...}, ...]`) and writes that resolved array into the built Hugo frontmatter under the *same field name*. Themes only ever see the resolved array form — never the raw `{"content": [...], "website": ...}` relation dict.

### Array guarantee

`video_captions_resources` and `video_transcript_resources`, as they appear in built Hugo frontmatter, are **always arrays** of `{"file": ..., "language": ...}` objects. Themes may still encounter a `null` or absent value (video has no captions yet), so treat `null` and missing as an empty list.

---

## 2. Path Construction

Every `file` value is a root-absolute URL path, e.g. `/courses/<url_path>/resources/<filename>`.  There is no scheme or host.

In production `RESOURCE_BASE_URL` (injected by the Concourse pipeline) is empty, so the file is served at:
```
<RESOURCE_BASE_URL><file>
→ "" + "/courses/8-01sc-physics-i/resources/lecture1_captions_vtt"
→ "/courses/8-01sc-physics-i/resources/lecture1_captions_vtt"
```

In dev, `RESOURCE_BASE_URL` is the Minio endpoint (e.g. `http://localhost:9000/ol-ocw-studio-app`), so the URL becomes a full absolute URL pointing to Minio.

Access the build-time variable inside Hugo shortcodes / partials as:
```go
{{ $base := os.Getenv "RESOURCE_BASE_URL" }}
{{ $url  := printf "%s%s" $base .file }}
```

---

## 3. Language Codes

The `language` field on every entry is an ISO 639-1 two-letter code (e.g. `"en"`, `"fr"`, `"zh"`, `"es"`).

An optional `locale` field may also be present — an ISO 3166-1 alpha-2 uppercase region code (e.g. `"US"`, `"GB"`).  When present, the full BCP-47 tag is `{language}-{locale}` (e.g. `"en-US"`, `"fr-FR"`).

```yaml
video_captions_resources:
  - file: /courses/…/lecture1_captions_vtt
    language: en
  - file: /courses/…/lecture1_captions_en_us_vtt
    language: en
    locale: US
  - file: /courses/…/lecture1_captions_fr_vtt
    language: fr
```

Use `language` (and `locale` when present) for the HTML `srclang` attribute on `<track>` elements and the `lang` attribute on transcript download links.

---

## 4. HTML Output Requirements

### 4.1 Caption Tracks (`video_captions_resources`)

Iterate the array and emit one `<track>` element per entry.

```html
<!-- Rendered by Hugo from the video_captions_resources array -->
<track
  kind="captions"
  src="{{ $base }}{{ .file }}"
  srclang="{{ .language }}"
  label="{{ humanLanguage .language }}"   <!-- see §4.3 -->
  {{ if eq .language "en" }}default{{ end }}
/>
```

Rules:
- One `<track>` per language.
- `srclang` must be the ISO 639-1 code from the `language` field.
- When `locale` is present, `srclang` may use the full BCP-47 tag (`"en-US"`) — browsers accept both.
- Mark the English track `default` (or the first track if no English entry exists).
- Do **not** show `kind="captions"` tracks as dropdown-visible tabs on their own — that is the browser's job.  Theme controls should let the user switch the active track via JS.

### 4.2 Transcript Downloads (`video_transcript_resources`)

Iterate the array and emit one download link per entry.

```html
<!-- Shown beneath the video player or in a Resources panel -->
<ul class="ocw-transcript-list">
  {{ range .Params.video_files.video_transcript_resources }}
  <li lang="{{ .language }}">
    <a
      href="{{ $base }}{{ .file }}"
      download
      aria-label="{{ humanLanguage .language }} transcript (PDF)"
    >
      {{ humanLanguage .language }} Transcript (PDF)
    </a>
  </li>
  {{ end }}
</ul>
```

Rules:
- Show one link per language in the array.
- The link text must include the human-readable language name **and** the file type, e.g. "French Transcript (PDF)".
- If the array has more than one entry the UI must not collapse them into a single link — each language is a separate download.
- If the array is empty or absent, hide the transcript section entirely (do not show a broken link or an empty list).

### 4.3 Human-Readable Language Names (`humanLanguage`)

Implement a Hugo template function or lookup map that converts ISO 639-1 codes to display names.  Minimum set required for v1:

| Code | English name |
|---|---|
| `en` | English |
| `fr` | French |
| `es` | Spanish |
| `zh` | Chinese |
| `de` | German |
| `ar` | Arabic |
| `pt` | Portuguese |
| `ja` | Japanese |
| `ko` | Korean |
| `ru` | Russian |

Fall back to displaying the raw code in uppercase (`EN`, `FR`) when the code is not in the map.

---

## 5. UI Placement

### Below-player layout (both v2 and v3)

```
┌──────────────────────────────────────────────────┐
│                                                  │
│               Video Player (YouTube)             │
│                                                  │
└──────────────────────────────────────────────────┘
│ ▼ Transcripts                                    │
│   English Transcript (PDF)   French Transcript (PDF) │
│                                                  │
│ CC tracks rendered via <track> elements (browser │
│ caption switcher or custom JS overlay)           │
└──────────────────────────────────────────────────┘
```

- The transcript list appears directly below the player, collapsible.
- Caption-track switching is handled via the browser's native caption menu or a custom CC button that calls `video.textTracks`.
- Both sections are **conditionally rendered** — omit entirely when the corresponding array is empty.

---

## 6. Zero-Language and Single-Language Compatibility

These must still render correctly:

| Case | `video_captions_resources` value | Expected behaviour |
|---|---|---|
| No captions | `null` or absent | No `<track>` elements; no CC button |
| Single English caption | `[{file: "…", language: "en"}]` | Single `<track>` element, marked default |
| Multiple languages | `[{…, language: "en"}, {…, language: "fr"}]` | All tracks rendered; English is default |
| No transcripts | `null` or absent | Transcript section hidden |
| Single English transcript | `[{file: "…", language: "en"}]` | One download link, label "English Transcript (PDF)" |
| Multiple transcripts | array with 2+ entries | One link per entry |

---

## 7. Partial Boundary (as actually implemented)

Studio does not dictate the internal decomposition of Hugo templates, but this is the actual current structure:

| Partial | Inputs | Responsibility |
|---|---|---|
| `video.html` / `video_v3.html` / `video_embed.html` | Full page `.Params` (or `$resource.Params` for the embed variant) | Top-level entry point per theme/context; reads `video_files.video_captions_resources`/`video_transcript_resources` directly and passes them into the two partials below |
| `video_caption_tracks.html` | `dict "context" ... "captionsFile" <resolved video_captions_resources array>` | Resolves the array into a slice of caption-track dicts (`src`, `srclang`, `label`, `isDefault`) |
| `video_transcript_links.html` | `dict "context" ... "transcriptFile" <resolved video_transcript_resources array>` | Resolves the array into a slice of transcript-link dicts (`href`, `language`, `locale`, `label`) |
| `video_player.html` | Resolved caption/transcript locations + tracks | Renders the `<video>`/`<iframe>` element and `<track>` elements |
| `video_expandable_tab.html` | Pre-built `transcriptLinks`/`captionTracks` dicts | Renders the collapsible transcript tab and language-selector UI |

Each partial should be callable with an empty or nil array and produce no output (not an HTML error).

---

## 8. Data-Contract Tests (Hugo Theme Side)

Theme developers should add Hugo test fixtures that exercise:

1. **Empty arrays** — `video_captions_resources: []` → no `<track>` elements in output
2. **Single English** — array with one `{language: "en"}` entry → one `<track default>` element
3. **Multi-language** — array with `en` + `fr` entries → two `<track>` elements; English is `default`; French has `srclang="fr"`
4. **Locale present** — `{language: "en", locale: "US"}` → `srclang="en-US"` or `"en"` (both acceptable)
5. **Transcript section hidden** — when `video_transcript_resources` is absent
6. **Transcript multi-language** — two entries produce two links with distinct labels

---

## 9. Studio-Side Data Produced (Reference)

This section is informational — themes do not need to replicate this logic.

| Source | Field written | Language detection |
|---|---|---|
| Google Drive VTT file | `video_captions_resources` (relation), resolved to array at git-sync time | `parse_caption_language_locale(filename)` — from filename suffix `_captions_{lang}_vtt` |
| Google Drive PDF file | `video_transcript_resources` (relation), resolved to array at git-sync time | `parse_caption_language_locale(filename)` — from filename suffix `_transcript_{lang}_pdf` |
| 3Play | `video_captions_resources` / `video_transcript_resources` (relation) | Hardcoded `"en"` — 3Play only ever provides English |
| Studio UI save (`auto_link_video_captions_transcript`) | Merges matching resources into the relation's `content` list by filename convention | Language resolved per-resource at git-sync time via `resource_file_paths`/`parse_caption_language_locale`, not hardcoded |

The canonical filename convention for GDrive caption/transcript resources is:

```
{video_base}_captions_vtt            (English default)
{video_base}_captions_{lang}_vtt     (localised, e.g. lecture1_captions_fr_vtt)
{video_base}_transcript_pdf          (English default)
{video_base}_transcript_{lang}_pdf   (localised)
```

`{lang}` is always a lowercase ISO 639-1 two-letter code.
