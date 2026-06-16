# Hugo Theme Contract — Multi-Language Captions & Transcripts

## Scope

This document defines the data contract that OCW Hugo themes (`ocw-course-v2` and `ocw-course-v3`) must implement to render multiple caption tracks and multiple transcript download links under the video player.  It is addressed to theme developers.  Studio produces the data; themes consume it.

---

## 1. Front-Matter Format

Every video resource YAML front-matter file contains a `video_files` object.  After the Studio multi-language migration, the caption and transcript sub-fields are **arrays of objects**, not strings.

```yaml
# content/resources/lecture1_video.md
---
uid: abc123-…
title: "Lecture 1: Introduction"
content_type: video_resource
video_files:
  video_captions_file:
    - file: /courses/8-01sc-physics-i/resources/lecture1_captions_vtt
      language: en
    - file: /courses/8-01sc-physics-i/resources/lecture1_captions_fr_vtt
      language: fr
    - file: /courses/8-01sc-physics-i/resources/lecture1_captions_zh_vtt
      language: zh
  video_transcript_file:
    - file: /courses/8-01sc-physics-i/resources/lecture1_transcript_pdf
      language: en
    - file: /courses/8-01sc-physics-i/resources/lecture1_transcript_fr_pdf
      language: fr
  video_captions_resources:
    content:
      - abc123-text-id-1
      - abc123-text-id-2
      - abc123-text-id-3
    website: 8-01sc-physics-i
  video_transcript_resources:
    content:
      - abc123-text-id-4
      - abc123-text-id-5
    website: 8-01sc-physics-i
  video_thumbnail_file: null
video_metadata:
  youtube_id: dQw4w9WgXcQ
---
```

### Array guarantee

`video_captions_file` and `video_transcript_file` are **always arrays**.  After migration 0073/0074, Studio never writes a bare string into these fields.  Themes may still encounter a `null` or absent value (video has no captions yet), so treat `null` and missing as an empty list.

`video_captions_resources` and `video_transcript_resources` hold relation-widget metadata only.  **Hugo templates must not read the `content` list directly** — use the `_file` arrays (or the resolved `_resources` arrays after `full_metadata()` runs) for all rendering logic.

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

The `language` field on every `_file` entry is an ISO 639-1 two-letter code (e.g. `"en"`, `"fr"`, `"zh"`, `"es"`).

An optional `locale` field may also be present — an ISO 3166-1 alpha-2 uppercase region code (e.g. `"US"`, `"GB"`).  When present, the full BCP-47 tag is `{language}-{locale}` (e.g. `"en-US"`, `"fr-FR"`).

```yaml
video_captions_file:
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

### 4.1 Caption Tracks (`video_captions_file`)

Iterate the array and emit one `<track>` element per entry.

```html
<!-- Rendered by Hugo from the video_captions_file array -->
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

### 4.2 Transcript Downloads (`video_transcript_file`)

Iterate the array and emit one download link per entry.

```html
<!-- Shown beneath the video player or in a Resources panel -->
<ul class="ocw-transcript-list">
  {{ range .Params.video_files.video_transcript_file }}
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

| Case | `video_captions_file` value | Expected behaviour |
|---|---|---|
| No captions | `null` or absent | No `<track>` elements; no CC button |
| Single English caption | `[{file: "…", language: "en"}]` | Single `<track>` element, marked default |
| Multiple languages | `[{…, language: "en"}, {…, language: "fr"}]` | All tracks rendered; English is default |
| No transcripts | `null` or absent | Transcript section hidden |
| Single English transcript | `[{file: "…", language: "en"}]` | One download link, label "English Transcript (PDF)" |
| Multiple transcripts | array with 2+ entries | One link per entry |

---

## 7. Shortcode / Partial Boundary

Studio does not dictate the internal decomposition of Hugo templates.  However the following boundaries are recommended:

| Partial | Inputs | Responsibility |
|---|---|---|
| `video-player.html` | Full page `.Params` | Renders the `<video>`/`<iframe>` element and iterates `video_captions_file` to emit `<track>` elements |
| `video-transcripts.html` | `video_files.video_transcript_file` array | Renders the transcript download list; receives the array directly so it is testable in isolation |

Each partial should be callable with an empty or nil array and produce no output (not an HTML error).

---

## 8. Data-Contract Tests (Hugo Theme Side)

Theme developers should add Hugo test fixtures that exercise:

1. **Empty arrays** — `video_captions_file: []` → no `<track>` elements in output
2. **Single English** — array with one `{language: "en"}` entry → one `<track default>` element
3. **Multi-language** — array with `en` + `fr` entries → two `<track>` elements; English is `default`; French has `srclang="fr"`
4. **Locale present** — `{language: "en", locale: "US"}` → `srclang="en-US"` or `"en"` (both acceptable)
5. **Transcript section hidden** — when `video_transcript_file` is absent
6. **Transcript multi-language** — two entries produce two links with distinct labels

---

## 9. Studio-Side Data Produced (Reference)

This section is informational — themes do not need to replicate this logic.

| Source | Field written | Language detection |
|---|---|---|
| Google Drive VTT file | `video_captions_file` | `parse_caption_language_locale(filename)` — from filename suffix `_captions_{lang}_vtt` |
| Google Drive PDF file | `video_transcript_file` | `parse_caption_language_locale(filename)` — from filename suffix `_transcript_{lang}_pdf` |
| 3Play (English only) | `video_captions_file` + `video_transcript_file` | Hardcoded `"en"` |
| API save (`sync_video_relation_urls`) | Derives `_file` from `_resource.content` | `"en"` for all (known limitation; to be fixed) |

The canonical filename convention for GDrive caption/transcript resources is:

```
{video_base}_captions_vtt            (English default)
{video_base}_captions_{lang}_vtt     (localised, e.g. lecture1_captions_fr_vtt)
{video_base}_transcript_pdf          (English default)
{video_base}_transcript_{lang}_pdf   (localised)
```

`{lang}` is always a lowercase ISO 639-1 two-letter code.

---

## 10. Known Limitation — `sync_video_relation_urls` Language Passthrough

When a user edits a video resource through the Studio UI and saves, `sync_video_relation_urls` rebuilds the `_file` array from the `_resource` relation widget.  In the current implementation this function hardcodes `"language": "en"` for every resource, discarding multi-language tags.

**Impact on themes:** a video edited through the UI after multi-language captions have been ingested from GDrive will have all caption entries reset to `language: "en"` in the front-matter until this is fixed.

**Workaround for themes:** implement correct rendering when multiple entries share the same `language` value (i.e. do not assume `language` is unique per entry).  The theme should not crash or produce duplicate tracks.

This limitation is tracked and will be fixed in a follow-on Studio change that uses `parse_caption_language_locale(resource.filename)` inside `sync_video_relation_urls`.
