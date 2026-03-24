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
- `course-offline-v3` is already referenced by the sibling offline Hugo config, but the theme directory does not exist in this repo yet.
- Webpack currently has entries for `course_v2`, `course_v3`, `course_offline`, and `www`, but not `course_offline_v3`.
- The existing offline bundle at `course-offline/assets/course-offline.ts` imports `course-v2` CSS and legacy offline JS. It is a useful bootstrap source but not an acceptable final bundle for offline v3.
- `.env` contains `COURSE_V3_HUGO_CONFIG_PATH` but not a dedicated offline-v3 config env.
- The E2E harness already supports multiple built sites through `TEST_SITES` and `LocalOcw`; offline-v3 only needs to be added as another course alias.

## Webpack Ownership
- Source of truth for entrypoints: `base-theme/assets/webpack/webpack.common.ts`
- Existing offline asset consumers:
  - `course-offline/layouts/partials/basejs.html`
  - `course-offline/layouts/partials/extrahead.html`
- Expected direction:
  - Add a new `course_offline_v3` entry instead of reusing `course_offline`.
  - Keep an offline-owned entrypoint even after switching to v3 CSS/JS imports.
  - Do not make offline-v3 depend directly on the online `course-v3` bundle name.

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
- Role: v2 offline overrides and course-specific offline link/CTA behavior; this is the bootstrap source for `course-offline-v3`.

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
- Built sites are produced by `tests-e2e/LocalOcw.ts`.
- Course aliases are built into `/courses/<site-name>` under `test-sites/tmp/dist`.
- `LocalOcw` already handles:
  - building each alias through Hugo
  - serving the built output
  - serving static API fixtures
- Practical implication: offline-v3 E2E support is a small extension, not a new harness.

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
- `course-v3/layouts/partials/resource_list_item.html`
  - Card title uses raw `.permalink`.
- `course-v3/layouts/partials/see_all.html`
  - Uses raw `.permalink`.
- `base-theme/layouts/shortcodes/resource_link.html`
  - Uses raw `.Permalink`.
- `base-theme/layouts/partials/footer-v3.html`
  - Uses hard-coded root-relative URLs that are not package-safe.
- `base-offline/layouts/partials/get_resource_download_link.html`
  - Emits root-absolute `/static_resources/...` for non-video files.
- Remote thumbnail dependence
  - v3 video-gallery cards may use remote YouTube thumbnails directly.

## Historical Note
- Release notes show:
  - `1.85.0`: `ocw-course-v3` and `course-offline-v2` were added.
  - `1.85.2`: `course-v3` and `course-offline-v3` were removed.
  - adjacent offline fixes included removing the offline download button and fixing offline video-gallery item URLs.
- Use that history as a warning that the likely friction points are download/browse behavior and video-gallery URLs.

## Core Source Files
- Config / env / build
  - `.env`
  - `base-theme/assets/webpack/webpack.common.ts`
  - `tests-e2e/util/test_sites.ts`
  - `tests-e2e/LocalOcw.ts`
- Shared offline helpers
  - `base-offline/layouts/partials/page_url.html`
  - `base-offline/layouts/partials/resource_url.html`
  - `base-offline/layouts/partials/site_root_url.html`
  - `base-offline/layouts/partials/get_resource_download_link.html`
  - `base-offline/layouts/partials/video.html`
  - `base-offline/layouts/partials/video_player.html`
  - `base-offline/layouts/shortcodes/image-gallery.html`
- Existing offline theme bootstrap
  - `course-offline/assets/course-offline.ts`
  - `course-offline/layouts/partials/basejs.html`
  - `course-offline/layouts/partials/extrahead.html`
  - `course-offline/layouts/partials/extrajs.html`
  - `course-offline/layouts/partials/nav_url.html`
  - `course-offline/layouts/partials/get_destination.html`
  - `course-offline/layouts/partials/get_canonical_url.html`
  - `course-offline/layouts/partials/course_home_page_url.html`
  - `course-offline/layouts/partials/resources_header.html`
  - `course-offline/layouts/partials/download_course_link_button.html`
- v3 layouts / partials
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
  - `course-v3/layouts/partials/resources_header.html`
  - `course-v3/layouts/partials/download_course_link_button.html`
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

## Chosen Defaults
- The first valid offline-v3 build may still look like v2; this is acceptable until the shared v3 bundle/chrome step.
- Shared offline fixes go to `base-offline` whenever they benefit both offline themes.
- `course-offline-v3` should only keep v3-specific overrides that cannot be cleanly shared.
- The goal is a portable packaged offline course, not just a localhost-only demo.
- Do not fork large v3 templates unless a partial-level override cannot isolate the offline behavior.
- Each step closes only after its own validation points pass and the regression gate has been run for existing `course-v2` offline, `course-v2` online, `course-v3` online, and any other directly impacted shared-theme coverage.
