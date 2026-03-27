# Offline `course-v3` Project Context

## Purpose
- This document is the single repo-memory file for the offline `course-v3` effort.
- It exists to prevent repeated whole-repo discovery. A sub-agent should be able to read this file, then [master-plan.md](./master-plan.md), then only its assigned step doc and listed source files.
- Scope: minimal workable offline `course-v3`, built for local E2E first, then tightened into a portable packaged offline site.
- Completion rule: implementation work is not considered finished at a step boundary until that step's validation points have been implemented and verified.

## Read Order For Sub-Agents
1. Read this file.
2. Read [master-plan.md](./master-plan.md).
3. Read only the assigned step doc under [docs/steps](./steps/).
4. Read only the source files listed in that step doc.
5. Do not expand the read surface unless a listed file is missing or clearly insufficient.

## Theme Layering
- Online v3 stack in the sibling Hugo project config:
  - `course-v3`
  - `base-theme`
- Intended offline v3 stack in `../ocw-hugo-projects/ocw-course-v3/config-offline.yaml`:
  - `base-offline`
  - `course-offline-v3`
  - `course-v3`
  - `base-theme`
- Practical rule:
  - `base-theme` owns shared generic and v3-capable presentation logic.
  - `course-v3` owns v3 course layouts, v3 course chrome, and v3 page/resource/list behavior.
  - `base-offline` owns reusable offline URL, asset, and media helpers.
  - `course-offline-v3` should stay thin and only override v3-specific offline behavior.

## Current Build / Config Truth
- `course-offline-v3/` exists with 13 partial overrides, a dedicated asset entrypoint, and empty `content/static_resources/`.
- Webpack defines `course_offline_v3` entry in `webpack.common.ts`: `[expose-jQuery.ts, course-offline-v3/assets/course-offline.ts, index.ts]`.
- `course-offline-v3/assets/course-offline.ts` imports v3 CSS/JS from `course-v3/assets/` (not v2). It initializes MIT Learn header, mobile course menu, v3 expanders, quiz logic, table-rowspan borders, image-gallery init, and Video.js.
- `env.ts` defines `COURSE_V3_OFFLINE_HUGO_CONFIG_PATH` (default: `../ocw-hugo-projects/ocw-course-v3/config-offline.yaml`).
- `tests-e2e/util/test_sites.ts` includes `course-v3-offline` alias that reuses `ocw-ci-test-course` content.
- `LocalOcw` builds and serves offline-v3 alongside the other three aliases automatically.
- Three E2E spec files exist under `tests-e2e/ocw-ci-test-course-v3-offline/`:
  - `smoke-v3-offline.spec.ts` — asset loading, representative page loads
  - `routing-v3-offline.spec.ts` — shortcode links, embedded video links, resource-card links, download links
  - `generic-content-pages.spec.ts` — syllabus/table, section/subsection loads, nav link locality, footer link assertions
- `course-offline-v3/` has no `go.mod` file. This is intentional — it inherits module identity through the theme chain and Hugo does not require a `go.mod` for pure-override themes.

## Webpack Ownership
- Source of truth for entrypoints: `base-theme/assets/webpack/webpack.common.ts`
- Offline-v3 asset consumers:
  - `course-offline-v3/layouts/partials/basejs.html` → loads `course_offline_v3.js`
  - `course-offline-v3/layouts/partials/extrahead.html` → loads `course_offline_v3.css` + `common.css`
- The offline-v3 entrypoint is separately owned — it does not depend on the online `course-v3` bundle name.

## Helper Ownership Map

### `base-offline`
- `layouts/partials/page_url.html`
- `layouts/partials/resource_url.html`
- `layouts/partials/site_root_url.html`
- `layouts/partials/path_to_root.html`
- `layouts/partials/webpack_url.html`
- `layouts/partials/get_search_url.html`
- `layouts/partials/get_resource_download_link.html`
- `layouts/partials/video.html`
- `layouts/partials/video_player.html`
- `layouts/shortcodes/image-gallery.html`
- Role: shared offline-safe asset, page, resource, and media behavior.

### `course-offline`
- `layouts/partials/nav_url.html`
- `layouts/partials/get_destination.html`
- `layouts/partials/get_canonical_url.html`
- `layouts/partials/course_home_page_url.html`
- `layouts/partials/resource_list_item_title.html`
- `layouts/partials/resources_header.html`
- `layouts/partials/download_course_link_button.html`
- `layouts/partials/basejs.html`
- `layouts/partials/extrahead.html`
- `layouts/partials/extrajs.html`
- Role: v2 offline overrides and course-specific offline link/CTA behavior.

### `course-offline-v3`
- **Shared copies from `course-offline`** (identical content, different bundle names where applicable):
  - `layouts/partials/course_home_page_url.html`
  - `layouts/partials/get_canonical_url.html`
  - `layouts/partials/get_destination.html`
  - `layouts/partials/resource_list_item_title.html`
  - `layouts/partials/resources_header.html` (intentionally blank)
  - `layouts/partials/extraheader.html` (empty)
  - `layouts/partials/extrajs.html` (empty)
- **v3-specific bundle wiring** (different from `course-offline` — reference `course_offline_v3` assets):
  - `layouts/partials/basejs.html`
  - `layouts/partials/extrahead.html`
- **v3-specific CTA** (different markup from `course-offline` — flexbox + SVG, says "Browse Resources"):
  - `layouts/partials/download_course_link_button.html`
- **v3-specific nav overrides** (do not exist in `course-offline`):
  - `layouts/partials/nav.html` — threads `.context` to every `nav_item.html` call for relative URL generation
  - `layouts/partials/nav_item.html` — extracts `.context` and passes it to `nav_url.html` and recursive children
  - `layouts/partials/nav_url.html` — uses `path_to_root.html` with page context for correct relative URLs in both test and offline-package environments
- Role: v3-specific offline overrides. Stays thin — only overrides what v2 offline cannot share.

### `course-v3`
- Layout ownership:
  - `layouts/home.html`
  - `layouts/pages/single.html`
  - `layouts/pages/section.html`
  - `layouts/pages/instructor_insights.html`
  - `layouts/resources/single.html`
  - `layouts/video_galleries/list.html`
  - `layouts/video_galleries/single.html`
  - `layouts/lists/single.html`
  - `layouts/learning_resource_types/term.html`
  - `layouts/learning_resource_types/taxonomy.html`
  - `layouts/external-resources/single.html`
- Partial ownership includes v3 header, nav, banner, course-detail, resource list, resources header, video-gallery page, and download CTA components.

### `base-theme`
- Owns shared v3-capable partials used by `course-v3`, including:
  - `partials/resource_title_v3.html`
  - `partials/resource_body_v3.html`
  - `partials/content_header_v3.html`
  - `partials/footer-v3.html`
  - `partials/video.html`
  - `partials/video_embed.html`
  - `partials/local_video_player.html`
  - `partials/youtube_player.html`
  - `partials/image_page.html`
  - `partials/pdf_viewer.html`
  - `partials/get_resource_download_link.html`
  - `partials/page_url.html`
  - `partials/resource_url.html`
  - `partials/get_destination.html`
  - `partials/get_canonical_url.html`
  - `partials/course_home_page_url.html`

## Page-Family Map

### Home page
- Layout: `course-v3/layouts/home.html`
- Main partials:
  - `header`
  - `course_banner`
  - `desktop_nav`
  - `mobile_course_menu_v3`
  - `course_detail`
  - `course_image_section`
  - `download_course_link_button`
  - `footer-v3`
- Offline concern: homepage CTAs should browse local resources, not tell the user to download the course again.

### Generic content pages
- Layout path:
  - `course-v3/layouts/pages/single.html`
  - `course-v3/layouts/pages/section.html`
  - `course-v3/layouts/pages/instructor_insights.html`
- Main render path: `course_content.html`
- Fixtures:
  - `/pages/assignments`
  - `/pages/syllabus`
  - `/pages/section-1`
  - `/pages/subsection-1a`
  - `/pages/subsection-1b`
  - `/pages/first-test-page-title`
  - `/pages/second-test-page`
  - `/pages/subscripts-and-superscripts`
  - `/pages/shortcode-demos`
- Offline concern: internal markdown links, shortcode links, and resource links must not rely on raw `.Permalink`.

### Embedded resource pages
- Fixtures:
  - `/pages/video-series-overview`
  - `/pages/multiple-videos-series-overview`
- Entry path: markdown `resource` shortcode in `base-theme/layouts/shortcodes/resource.html`
- Offline concern: embedded video links, transcript links, and local media resolution.

### Quiz page
- Fixture: `/pages/quiz-demo`
- Shortcodes owned by `course-v3`:
  - `quiz_multiple_choice`
  - `quiz_choices`
  - `quiz_choice`
  - `quiz_solution`
- Offline concern: JS initialization remains present after the v3 bundle switch.

### Image gallery / shortcode-heavy pages
- Fixtures:
  - `/pages/image-gallery`
  - `/pages/shortcode-demos`
- Shortcodes involved:
  - `base-theme/layouts/shortcodes/image-gallery.html`
  - `base-offline/layouts/shortcodes/image-gallery.html`
  - `base-theme/layouts/shortcodes/resource_link.html`
- Offline concern: local gallery base URL and local resource-link URLs.

### Resource-list pages
- Fixtures:
  - `/lists/a-resource-list`
  - `/download` grouped term lists
- Entry partials:
  - `course-v3/layouts/partials/resource_list.html`
  - `course-v3/layouts/partials/resource_list_item.html`
  - `course-v3/layouts/partials/resource_list_collapsible.html`
  - `course-v3/layouts/partials/see_all.html`
- Offline concern: raw `.permalink` card links and download link destinations.

### Download / browse page
- Route: `/download`
- Rendered through v3 learning-resource-type taxonomy/term flow.
- Offline concern: convert online download messaging into a useful offline browse surface.

### Non-video resource pages
- Layout: `course-v3/layouts/resources/single.html`
- Main partials:
  - `resource_title_v3`
  - `resource_body_v3`
  - `image_page`
  - `pdf_viewer`
- Fixtures:
  - `/resources/file_pdf`
  - `/resources/example_pdf`
  - `/resources/example_jpg`
  - `/resources/example_notes`
- Offline concern: local file/view links and any root-relative asset/file behavior.

### Video gallery pages
- Layout:
  - `course-v3/layouts/video_galleries/list.html`
  - `course-v3/layouts/video_galleries/single.html`
- Partials:
  - `video-gallery-page`
  - `video-gallery-item`
- Fixture: `/video_galleries/lecture-videos`
- Offline concern: remote YouTube thumbnails should be optional, not required.

### Video detail pages
- Resource layout still flows through `resource_body_v3`.
- Video helpers involved:
  - `base-theme/layouts/partials/video.html`
  - `base-theme/layouts/partials/video_embed.html`
  - `base-theme/layouts/partials/local_video_player.html`
  - `base-theme/layouts/partials/youtube_player.html`
  - `base-offline/layouts/partials/video.html`
  - `base-offline/layouts/partials/video_player.html`
- Fixtures:
  - `/resources/ocw_test_course_mit8_01f16_l01v01_360p`
  - `/resources/ocw_test_course_mit8_01f16_l26v02_360p`
- Offline concern: local MP4, transcript, captions, related resources, and optional-tab behavior.

### External-resource behavior
- Fixture: `/pages/external-resources-page`
- Related layout: `course-v3/layouts/external-resources/single.html`
- Shared behavior relies on `external_resource_link`.
- Offline concern: preserve external warning/new-tab behavior while keeping internal links local.

## Shortcode Map
- `base-theme/layouts/shortcodes/resource.html`
  - Embeds image, video, or file resources based on resource type.
- `base-theme/layouts/shortcodes/resource_link.html`
  - Currently emits raw `.Permalink` for non-external resources.
- `base-offline/layouts/shortcodes/image-gallery.html`
  - Sets gallery base URL through `resource_url.html` and initializes gallery JS on load.
- `course-v3/layouts/shortcodes/video-gallery.html`
  - Delegates to the `video-gallery` partial.
- `course-v3/layouts/shortcodes/resource_file.html`
  - Returns `resource_url.html` for a resource file.
- `course-v3/layouts/shortcodes/quiz_*.html`
  - Provide quiz DOM structure; JS comes from the bundle.

## E2E Harness Flow
- Site aliases are defined in `tests-e2e/util/test_sites.ts`.
  - `course-v3-offline` alias already exists, pointing at the v3 offline Hugo config.
- Built sites are produced by `tests-e2e/LocalOcw.ts`.
- Course aliases are built into `/courses/<site-name>` under `test-sites/tmp/dist`.
- `LocalOcw` already handles:
  - building each alias through Hugo
  - serving the built output
  - serving static API fixtures
- The `course-v3-offline` harness is fully wired. New E2E specs only need to import the alias and write assertions.

### Existing E2E Coverage (offline-v3)

| Spec file | Routes tested | Assertions |
|---|---|---|
| `smoke-v3-offline.spec.ts` | `/`, `/pages/syllabus`, `/lists/a-resource-list`, `/resources/example_pdf` | Page loads, v3 CSS/JS asset references present |
| `routing-v3-offline.spec.ts` | `/pages/shortcode-demos` (shortcode links), embedded video links, resource-card titles/downloads | All links are package-local (no absolute `http://`), download hrefs point to `static_resources/` |
| `generic-content-pages.spec.ts` | `/pages/syllabus`, `/pages/section-1`, `/pages/subsection-1a` | Table renders, section content loads, nav links are package-local, footer link assertions |

### E2E Coverage Gaps (offline-v3)
- **Video pages**: No spec for `/video_galleries/lecture-videos` or individual video resource pages.
- **Image gallery**: No spec for `/pages/image-gallery` shortcode rendering offline.
- **Quiz**: No spec for `/pages/quiz-demo` interactive behaviour offline.
- **PDF viewer**: No spec for PDF resource page render offline.
- **External resource redirect**: No spec for external resource page behaviour offline.
- **Download page**: No spec for `/download` page or "Browse Resources" CTA.

## Test-Course Route Inventory
- Home: `/`
- Generic pages:
  - `/pages/assignments`
  - `/pages/syllabus`
  - `/pages/section-1`
  - `/pages/subsection-1a`
  - `/pages/subsection-1b`
  - `/pages/first-test-page-title`
  - `/pages/second-test-page`
  - `/pages/subscripts-and-superscripts`
  - `/pages/shortcode-demos`
- Embedded resource pages:
  - `/pages/video-series-overview`
  - `/pages/multiple-videos-series-overview`
- Interactive content:
  - `/pages/quiz-demo`
  - `/pages/image-gallery`
- Lists / taxonomy:
  - `/lists/a-resource-list`
  - `/download`
- Resource pages:
  - `/resources/file_pdf`
  - `/resources/example_pdf`
  - `/resources/example_jpg`
  - `/resources/example_notes`
  - `/resources/ocw_test_course_mit8_01f16_l01v01_360p`
  - `/resources/ocw_test_course_mit8_01f16_l26v02_360p`
- Video gallery:
  - `/video_galleries/lecture-videos`
- External-resource page:
  - `/pages/external-resources-page`

## Known Hotspots

### Resolved
- ~~`course-v3/layouts/partials/resource_list_item.html` — card title uses raw `.permalink`.~~ → v3's `resource_list_item.html` calls `page_url.html` inline for offline-safe URLs; no separate title-partial override needed.
- ~~Nav URLs produced absolute paths in offline packages.~~ → `course-offline-v3` nav overrides (`nav.html`, `nav_item.html`, `nav_url.html`) thread page context through `path_to_root.html`.
- ~~Download CTA said "Download Course" in offline context.~~ → `course-offline-v3/layouts/partials/download_course_link_button.html` says "Browse Resources".
- ~~Resources header showed download instructions offline.~~ → `course-offline-v3/layouts/partials/resources_header.html` is intentionally blank.
- ~~`course-v3/layouts/partials/see_all.html` — uses raw `.permalink`.~~ → Accepts `.permalink` via dict; `resource_list_collapsible.html` now passes `.RelPermalink`, and `page_url.html` rewrites it offline.
- ~~`base-theme/layouts/shortcodes/resource_link.html` — uses raw `.Permalink`.~~ → Routing spec confirms shortcode links are package-local through the existing theme chain.
- ~~`base-theme/layouts/partials/footer-v3.html` — hard-coded root-relative URLs.~~ → Footer now routes links through `home_url.html` and `site_root_url.html`.
- ~~`base-offline/layouts/partials/get_resource_download_link.html` — root-absolute `/static_resources/...` URLs.~~ → Download links validated as package-local by routing spec.

### Remaining
- Remote YouTube thumbnail dependence — v3 video-gallery cards use remote thumbnails directly. Needs offline fallback (step 13).

## Historical Note
- Release notes show:
  - `1.85.0`: `ocw-course-v3` and `course-offline-v2` were added.
  - `1.85.2`: `course-v3` and `course-offline-v3` were removed.
  - adjacent offline fixes included removing the offline download button and fixing offline video-gallery item URLs.
- Use that history as a warning that the likely friction points are download/browse behavior and video-gallery URLs.

## Core Source Files
- Config / env / build
  - `env.ts` (`COURSE_V3_OFFLINE_HUGO_CONFIG_PATH`)
  - `base-theme/assets/webpack/webpack.common.ts` (`course_offline_v3` entry)
  - `tests-e2e/util/test_sites.ts` (`course-v3-offline` alias)
  - `tests-e2e/LocalOcw.ts`
- Shared offline helpers
  - `base-offline/layouts/partials/page_url.html`
  - `base-offline/layouts/partials/resource_url.html`
  - `base-offline/layouts/partials/site_root_url.html`
  - `base-offline/layouts/partials/path_to_root.html`
  - `base-offline/layouts/partials/get_resource_download_link.html`
  - `base-offline/layouts/partials/video.html`
  - `base-offline/layouts/partials/video_player.html`
  - `base-offline/layouts/shortcodes/image-gallery.html`
- Offline-v3 theme
  - `course-offline-v3/assets/course-offline.ts`
  - `course-offline-v3/layouts/partials/basejs.html`
  - `course-offline-v3/layouts/partials/extrahead.html`
  - `course-offline-v3/layouts/partials/nav.html` (v3-specific)
  - `course-offline-v3/layouts/partials/nav_item.html` (v3-specific)
  - `course-offline-v3/layouts/partials/nav_url.html` (v3-specific)
  - `course-offline-v3/layouts/partials/download_course_link_button.html` (v3-specific)
  - `course-offline-v3/layouts/partials/resources_header.html`
  - `course-offline-v3/layouts/partials/resource_list_item_title.html`
  - `course-offline-v3/layouts/partials/course_home_page_url.html`
  - `course-offline-v3/layouts/partials/get_canonical_url.html`
  - `course-offline-v3/layouts/partials/get_destination.html`
  - `course-offline-v3/layouts/partials/extraheader.html`
  - `course-offline-v3/layouts/partials/extrajs.html`
- Existing offline theme (v2 reference)
  - `course-offline/assets/course-offline.ts`
  - `course-offline/layouts/partials/` (11 files)
- v3 layouts / partials (inherited by offline-v3)
  - `course-v3/layouts/home.html`
  - `course-v3/layouts/pages/single.html`
  - `course-v3/layouts/pages/section.html`
  - `course-v3/layouts/resources/single.html`
  - `course-v3/layouts/video_galleries/list.html`
  - `course-v3/layouts/video_galleries/single.html`
  - `course-v3/layouts/lists/single.html`
  - `course-v3/layouts/learning_resource_types/term.html`
  - `course-v3/layouts/learning_resource_types/taxonomy.html`
  - `course-v3/layouts/partials/header.html`
  - `course-v3/layouts/partials/mobile_course_menu_v3.html`
  - `course-v3/layouts/partials/course_banner.html`
  - `course-v3/layouts/partials/course_detail.html`
  - `course-v3/layouts/partials/resource_list_item.html`
  - `course-v3/layouts/partials/see_all.html`
  - `course-v3/layouts/partials/video-gallery-page.html`
  - `course-v3/layouts/partials/video-gallery-item.html`
- Shared v3-capable base partials
  - `base-theme/layouts/partials/resource_title_v3.html`
  - `base-theme/layouts/partials/resource_body_v3.html`
  - `base-theme/layouts/partials/content_header_v3.html`
  - `base-theme/layouts/partials/footer-v3.html`
  - `base-theme/layouts/partials/video_embed.html`
  - `base-theme/layouts/partials/local_video_player.html`
  - `base-theme/layouts/partials/youtube_player.html`
  - `base-theme/layouts/partials/image_page.html`
  - `base-theme/layouts/partials/pdf_viewer.html`
  - `base-theme/layouts/shortcodes/resource.html`
  - `base-theme/layouts/shortcodes/resource_link.html`
- E2E specs (offline-v3)
  - `tests-e2e/ocw-ci-test-course-v3-offline/smoke-v3-offline.spec.ts`
  - `tests-e2e/ocw-ci-test-course-v3-offline/routing-v3-offline.spec.ts`
  - `tests-e2e/ocw-ci-test-course-v3-offline/generic-content-pages.spec.ts`

## Shared Code Risk Register

| Shared File | Steps That May Touch It | Regression Specs |
|---|---|---|
| `base-offline/layouts/partials/video.html` | 07, 14 | `video.spec.ts`, `video-tabs.spec.ts` |
| `base-offline/layouts/partials/video_player.html` | 07, 14 | `video.spec.ts`, `video-tabs.spec.ts` |
| `base-offline/layouts/partials/get_resource_download_link.html` | 10, 12 | `download.spec.ts`, `resource-page-v3.spec.ts` |
| `base-theme/layouts/shortcodes/resource_link.html` | 03 (done), 09 | `shortcodes.spec.ts`, `routing-v3-offline.spec.ts` |
| `base-theme/layouts/shortcodes/resource.html` | 07 | `shortcodes.spec.ts`, `video.spec.ts` |
| `base-theme/layouts/partials/footer-v3.html` | 04 (remaining) | `footer.spec.ts`, `generic-content-pages.spec.ts` |
| `base-theme/layouts/partials/video_embed.html` | 07 | `video.spec.ts`, `routing-v3-offline.spec.ts` |
| `base-offline/layouts/shortcodes/image-gallery.html` | 09 | `image-gallery.spec.ts` |

## Chosen Defaults
- Shared offline fixes go to `base-offline` whenever they benefit both offline themes.
- `course-offline-v3` should only keep v3-specific overrides that cannot be cleanly shared.
- The goal is a portable packaged offline course, not just a localhost-only demo.
- Do not fork large v3 templates unless a partial-level override cannot isolate the offline behavior.
- Steps 07-09 are parallelizable — they are independent content-page subtypes with a shared regression gate.
- Each step closes only after its own validation points pass and the regression gate has been run for existing `course-v2` offline, `course-v2` online, `course-v3` online, and any other directly impacted shared-theme coverage.
