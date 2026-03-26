# Minimal Workable `course-v3` Offline Theme Plan

## Summary
- Goal: get a buildable, navigable offline `course-v3` theme working first for local E2E, then close page-family gaps one page type at a time.
- Final theme stack remains `base-offline -> course-offline-v3 -> course-v3 -> base-theme`; `course-offline-v3` must stay a thin override theme rather than becoming a fork of `course-v3`.
- Steps 01–06 are complete: the theme directory exists, the webpack bundle uses v3 CSS/JS, E2E plumbing is in place, offline URL routing is handled, and generic content pages render correctly. The remaining work (steps 07–16) covers media-heavy pages, interactive content, and final parity validation.
- This document is the canonical implementation index. Sub-agents should read [project-context.md](./project-context.md) first, then this file, then only their assigned step document in [docs/steps](./steps/).
- A step is not complete when code lands; it is complete only when the validation points in that step document have been implemented and verified.

## Current Repo Truth
- The sibling Hugo project config `../ocw-hugo-projects/ocw-course-v3/config-offline.yaml` points at the theme stack: `["base-offline", "course-offline-v3", "course-v3", "base-theme"]`.
- `course-offline-v3/` exists with 13 partial overrides in `layouts/partials/`, an asset entrypoint at `assets/course-offline.ts`, and an empty `content/static_resources/` directory. It has no `go.mod` (inherits module identity via the theme chain; Hugo does not require one for a pure-override theme).
- [course-offline-v3/assets/course-offline.ts](../course-offline-v3/assets/course-offline.ts) imports v3 CSS/JS directly from `course-v3/assets/` (not v2). It initializes MIT Learn header, mobile course menu, v3 expanders, quiz logic, table-rowspan borders, image-gallery init, and Video.js.
- [base-theme/assets/webpack/webpack.common.ts](../base-theme/assets/webpack/webpack.common.ts) defines `course_offline_v3` as a dedicated entry: `[expose-jQuery.ts, course-offline-v3/assets/course-offline.ts, index.ts]`.
- [env.ts](../env.ts) defines `COURSE_V3_OFFLINE_HUGO_CONFIG_PATH` (default: `../ocw-hugo-projects/ocw-course-v3/config-offline.yaml`).
- [tests-e2e/util/test_sites.ts](../tests-e2e/util/test_sites.ts) includes a `course-v3-offline` alias that reuses `ocw-ci-test-course` content and builds to `ocw-ci-test-course-v3-offline`.
- [tests-e2e/LocalOcw.ts](../tests-e2e/LocalOcw.ts) builds and serves the offline-v3 site alongside the other three aliases.
- Three E2E spec files exist under `tests-e2e/ocw-ci-test-course-v3-offline/`:
  - `smoke-v3-offline.spec.ts` — home, generic page, resource list, resource page loads + asset references
  - `routing-v3-offline.spec.ts` — shortcode links, embedded video links, resource-card titles, download links are package-local
  - `generic-content-pages.spec.ts` — syllabus/table, section/subsection loads, nav link locality, footer link assertions
- The test content source of truth remains [test-sites/ocw-ci-test-course](../test-sites/ocw-ci-test-course).
- The 13 partials in `course-offline-v3/layouts/partials/` are: 10 shared copies from `course-offline` (`basejs`, `course_home_page_url`, `download_course_link_button`, `extrahead`, `extraheader`, `extrajs`, `get_canonical_url`, `get_destination`, `resource_list_item_title`, `resources_header`) plus 3 v3-specific overrides (`nav.html`, `nav_item.html`, `nav_url.html`) that thread page context for relative URL generation via `path_to_root.html`.

## Known Offline Hotspots

### Resolved
- ~~[course-v3/layouts/partials/resource_list_item.html](../course-v3/layouts/partials/resource_list_item.html) uses raw `.permalink` for resource-card titles.~~ → Handled by `course-offline-v3/layouts/partials/resource_list_item_title.html` override (step 03).
- ~~Nav URL routing produced absolute paths in offline packages.~~ → Handled by `course-offline-v3/layouts/partials/nav.html`, `nav_item.html`, `nav_url.html` which thread page context through `path_to_root.html` (step 03).
- ~~Download CTA said "Download Course" in offline context.~~ → `course-offline-v3/layouts/partials/download_course_link_button.html` now says "Browse Resources" with v3 SVG styling (step 05).
- ~~Resources header showed download instructions offline.~~ → `course-offline-v3/layouts/partials/resources_header.html` is intentionally blank (step 05).

### Remaining
- [course-v3/layouts/partials/see_all.html](../course-v3/layouts/partials/see_all.html) uses raw `.permalink` for "See all" links. Needs `course-offline-v3` override or shared helper fix.
- [base-theme/layouts/partials/footer-v3.html](../base-theme/layouts/partials/footer-v3.html) emits root-relative links like `/`, `/about`, `/accessibility`, `/terms`, and `/contact`. Needs offline override to prevent broken links in packaged offline use.
- [base-offline/layouts/partials/get_resource_download_link.html](../base-offline/layouts/partials/get_resource_download_link.html) emits root-absolute `/static_resources/...` URLs for non-video files. May need path-to-root rewriting for full portability.
- [base-theme/layouts/shortcodes/resource_link.html](../base-theme/layouts/shortcodes/resource_link.html) uses raw `.Permalink`. Routing spec (`routing-v3-offline.spec.ts`) already validates shortcode links are package-local, so this either has an override in the theme chain or needs one.
- `course-v3` video gallery cards depend on remote YouTube thumbnails, which is not acceptable as a hard dependency for packaged offline use (step 13).

## Shortcode Ownership
- `base-theme` owns the base `resource`, `resource_link`, `image-gallery`, `image-gallery-item`, and general markdown helper shortcodes.
- `base-offline` overrides `image-gallery` for offline gallery initialization and local asset behavior.
- `course-v3` owns the quiz shortcodes, `video-gallery`, and `resource_file`.
- `course-offline-v3` should only add shortcode overrides if the shared base behavior cannot be made offline-safe through `base-offline`.

## Documentation Pack
- Shared repo-memory doc: [project-context.md](./project-context.md)
- Step docs:
  - [01-integration-bootstrap.md](./steps/01-integration-bootstrap.md)
  - [02-offline-build-and-e2e-plumbing.md](./steps/02-offline-build-and-e2e-plumbing.md)
  - [03-shared-offline-url-and-routing.md](./steps/03-shared-offline-url-and-routing.md)
  - [04-v3-bundle-and-shared-chrome.md](./steps/04-v3-bundle-and-shared-chrome.md)
  - [05-home-page.md](./steps/05-home-page.md)
  - [06-generic-content-pages.md](./steps/06-generic-content-pages.md)
  - [07-embedded-resource-pages.md](./steps/07-embedded-resource-pages.md)
  - [08-interactive-quiz-page.md](./steps/08-interactive-quiz-page.md)
  - [09-image-gallery-and-shortcode-pages.md](./steps/09-image-gallery-and-shortcode-pages.md)
  - [10-resource-list-pages.md](./steps/10-resource-list-pages.md)
  - [11-download-browse-page.md](./steps/11-download-browse-page.md)
  - [12-non-video-resource-pages.md](./steps/12-non-video-resource-pages.md)
  - [13-video-gallery-pages.md](./steps/13-video-gallery-pages.md)
  - [14-video-detail-pages.md](./steps/14-video-detail-pages.md)
  - [15-external-resource-behavior.md](./steps/15-external-resource-behavior.md)
  - [16-final-parity-sweep.md](./steps/16-final-parity-sweep.md)

## Step Completion Checklist

| Step | Status | Key Deliverables | E2E Specs |
|------|--------|-----------------|-----------|
| 01 | ✅ Done | `course-offline-v3/` dir, webpack `course_offline_v3` entry | — |
| 02 | ✅ Done | `env.ts` path, `test_sites.ts` alias, `LocalOcw` builds | `smoke-v3-offline.spec.ts` |
| 03 | ✅ Done | `nav.html`, `nav_item.html`, `nav_url.html` + 10 ported helpers | `routing-v3-offline.spec.ts` |
| 04 | ✅ Done | v3 bundle entry, `basejs.html`, `extrahead.html` | smoke (v3 asset refs) |
| 05 | ✅ Done | `download_course_link_button.html` ("Browse Resources"), `resources_header.html` (blank) | smoke (homepage) |
| 06 | ✅ Done | Generic page validation — no layout overrides needed | `generic-content-pages.spec.ts` |
| 07 | Remaining | Embedded video page validation (transcript, captions, download links) | Partial: routing spec covers link locality |
| 08 | Remaining | Quiz E2E test (bundle imports already done in step 04) | ❌ Missing |
| 09 | Remaining | Image gallery E2E test (bundle + shortcode override already done) | ❌ Missing |
| 10 | Remaining | `see_all.html` verification; resource-list edge cases | Partial: routing spec covers card links |
| 11 | Remaining | Download page E2E validation (overrides already exist) | Partial: routing spec covers link locality |
| 12 | Remaining | PDF viewer, image page, download button locality | Partial: smoke covers `/resources/file_pdf` |
| 13 | Remaining | `video-gallery-item.html` thumbnail fallback override | ❌ Missing |
| 14 | Remaining | Video detail page E2E (captions, transcript, tabs, start/end time) | ❌ Missing |
| 15 | Remaining | External-resource E2E validation (nav override already done) | ❌ Missing |
| 16 | Remaining | Fill remaining E2E gaps; must-green gate across 4 lanes | See coverage table in step 16 |

## Step Completion Rule
- Every implementation step has its own `Validation Points` section in the corresponding step document.
- A step cannot be marked complete until:
  - the implementation tasks for that step are finished
  - the acceptance routes for that step have been exercised
  - every validation point for that step has been verified
- Every step also has a regression gate:
  - build the existing `course-v2` offline site after the step and confirm it still builds
  - run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes
  - if the step touches shared helpers, shared partials, webpack/env wiring, or the E2E harness, broaden the regression check to every impacted theme
- If a validation point fails, the step remains open even if the code changes are already in place.

## Stepwise Plan

### 1. Integration bootstrap — ✅ COMPLETE
- Goal: create a separately owned v3 offline theme and get the first buildable output.
- `course-offline-v3/` created with 13 partial overrides and a dedicated asset entrypoint.
- Webpack entry `course_offline_v3` added to `webpack.common.ts`.
- Hugo builds successfully using `config-offline.yaml`; generated HTML references `course_offline_v3` CSS/JS.

### 2. Offline build and E2E plumbing — ✅ COMPLETE
- Goal: make offline v3 a first-class local test target.
- `COURSE_V3_OFFLINE_HUGO_CONFIG_PATH` added to `env.ts`. `course-v3-offline` alias added to `test_sites.ts`.
- `LocalOcw` builds and serves the offline-v3 site alongside existing aliases.
- `smoke-v3-offline.spec.ts` exercises home, generic page, resource list, and resource page loads.

### 3. Shared offline URL and routing layer — ✅ COMPLETE
- Goal: make the site portable as an extracted offline package, not just a localhost demo.
- Course-specific offline helpers ported from `course-offline`: `nav_url`, `course_home_page_url`, `get_destination`, `get_canonical_url`.
- Added v3-specific `nav.html` and `nav_item.html` overrides that thread page context through `path_to_root.html` for correct relative URLs.
- `routing-v3-offline.spec.ts` validates shortcode links, embedded video links, resource-card titles, and download links are package-local.
- **Deviation from plan**: `nav.html` + `nav_item.html` were added (not in original expected edit set) because v3 nav structure required context threading that v2 nav did not need.

### 4. Shared v3 bundle and chrome convergence — ✅ COMPLETE
- Goal: move from copied v2 offline behavior to v3-owned CSS/JS and shared v3 chrome, without losing offline-specific behavior.
- `course-offline-v3/assets/course-offline.ts` imports v3 CSS (`course-v3.scss`), MIT Learn header, mobile course menu, v3 expanders, quiz logic, image-gallery init, table-rowspan borders, and Video.js — all from `course-v3/assets/`.
- Entrypoint remains offline-owned (no React/QueryClient, no PostHog, no feature flags).
- v3 header, banner, nav, course-info panels, and footer-v3 are inherited from the theme chain.
- **Remaining**: `footer-v3.html` still emits hard-coded root-relative URLs (`/about`, `/terms`, etc.) — needs offline override for full portability.

### 5. Home page — ✅ COMPLETE
- Goal: make `/` a stable offline entry point.
- v3 home layout inherited without forking. Course description, info, topics, learning resource types, and course image blocks render correctly.
- `download_course_link_button.html` override changes CTA from "Download Course" to "Browse Resources" with v3 flexbox + SVG styling, pointing at the local `/download` browse page.
- `resources_header.html` override is intentionally blank (suppresses online download instructions).
- `smoke-v3-offline.spec.ts` validates home page loads with correct v3 assets.

### 6. Generic content pages — ✅ COMPLETE
- Goal: make standard `pages/*` content correct before tackling media-heavy pages.
- v3 page and section layouts inherited without forking. No layout-level overrides needed.
- `generic-content-pages.spec.ts` covers: syllabus/table rendering, section/subsection page loads, nav link locality (desktop nav links are relative), and footer link assertions.
- Acceptance routes covered by specs: `syllabus`, `section-1`, `subsection-1a`, `subsection-1b`, `first-test-page-title`, `second-test-page`.
- **Remaining gap**: `shortcode-demos` and `subscripts-and-superscripts` are covered by `routing-v3-offline.spec.ts` (link locality), but not by page-content assertions. `instructor_insights` fixture not yet validated.

### 7. Embedded resource pages *(parallelizable with 8, 9)*
- Goal: support pages that embed video resources inside normal markdown pages.
- Cover `video-series-overview` and `multiple-videos-series-overview`.
- Validate the shared `resource` shortcode path through embedded video rendering, especially the "View video page" link, download links, transcript links, and start/end-time behavior.
- **Existing coverage**: `routing-v3-offline.spec.ts` already validates "embedded video page links stay package-local" on `video-series-overview`. Remaining work is transcript/caption/download link locality and repeated-embed collision testing.
- **Regression**: if modifying `base-offline/layouts/partials/video.html` or `video_player.html`, re-run `tests-e2e/ocw-ci-test-course/video.spec.ts` and `video-tabs.spec.ts`.

### 8. Interactive quiz page *(parallelizable with 7, 9)*
- Goal: preserve quiz behavior on regular content pages.
- Cover `quiz-demo`.
- **Likely already complete**: `course-offline-v3/assets/course-offline.ts` imports `clearSolution`, `checkAnswer`, `showSolution` from `course-v3/assets/js/quiz_multiple_choice` (done in step 04). Primary deliverable is adding a quiz-specific E2E test.
- Keep the offline bundle support for multiple-choice initialization and preserve v3 styling hooks.

### 9. Image gallery and shortcode-heavy pages *(parallelizable with 7, 8)*
- Goal: cover interactive content patterns that rely on shared shortcodes and offline helpers.
- Cover `image-gallery` and shortcode-driven resource-link pages.
- **Existing coverage**: `routing-v3-offline.spec.ts` already validates shortcode-generated resource links on `shortcode-demos` are package-local. `base-offline/layouts/shortcodes/image-gallery.html` is the active override. `initNanogallery2` is in the offline bundle.
- Primary remaining work: E2E test for gallery initialization and controls.
- **Regression**: `tests-e2e/ocw-ci-test-course/image-gallery.spec.ts` and `shortcodes.spec.ts` must still pass.

### 10. Resource-list pages
- Goal: make list-style resource browsing fully portable offline.
- Cover `/lists/a-resource-list` and learning-resource-type term pages, since both reuse the same list/card partials.
- **Existing coverage**: `routing-v3-offline.spec.ts` already validates resource-card titles and download links on `/lists/a-resource-list` and `/download` are package-local. `resource_list_item_title.html` override already exists in `course-offline-v3`.
- Primary remaining work: verify `see_all.html` behavior and any uncovered edge cases.
- **Regression**: `tests-e2e/ocw-ci-test-course/resource-list.spec.ts` (v2) and `tests-e2e/ocw-ci-test-course-v3/resource-list-v3.spec.ts` (v3 online) must still pass.

### 11. Download / browse page
- Goal: turn the v3 taxonomy-driven download page into a useful offline browse page.
- Cover `/download` and its collapsible learning-resource-type groups.
- **Likely already complete**: `resources_header.html` (blank) and `download_course_link_button.html` ("Browse Resources") overrides already exist. `routing-v3-offline.spec.ts` validates download-page resource links are package-local.
- Primary remaining work: E2E validation that page structure, grouped lists, and offline heading/instructions are correct.
- **Regression**: `tests-e2e/ocw-ci-test-course/download.spec.ts` must still pass.

### 12. Non-video resource pages
- Goal: make file, PDF, and image resource detail pages work cleanly offline.
- Cover document, image, and generic file resources such as `file_pdf`, `example_jpg`, `example_pdf`, and `example_notes`.
- **Existing coverage**: `smoke-v3-offline.spec.ts` validates `/resources/file_pdf` loads successfully.
- Primary remaining work: validate PDF viewer, image-page display, download button locality, and any root-relative asset paths.
- `base-offline/layouts/partials/get_resource_download_link.html` handles non-video download link rewriting; verify it works for v3 resource page structure.
- **Regression**: `tests-e2e/ocw-ci-test-course-v3/resource-page-v3.spec.ts` must still pass.

### 13. Video gallery pages
- Goal: make video-gallery landing pages usable offline without relying on remote thumbnails.
- Cover `/video_galleries/lecture-videos`.
- Keep the v3 gallery layout and local card navigation while treating remote YouTube thumbnails as optional.
- Thumbnail fallback strategy: use `video_thumbnail_file` from frontmatter resolved through `resource_url.html` if present; otherwise render text-only card without broken-image placeholder.
- **Likely needs**: `course-offline-v3/layouts/partials/video-gallery-item.html` override for thumbnail fallback logic.
- **Regression**: `tests-e2e/ocw-ci-test-course-v3/video-gallery-v3.spec.ts` must still pass.

### 14. Video detail pages
- Goal: finish the highest-complexity page family last.
- Cover representative video resources such as `ocw_test_course_mit8_01f16_l01v01_360p` and `ocw_test_course_mit8_01f16_l26v02_360p`.
- Keep the v3 resource-page structure, but rely on the shared offline video-player stack for local MP4, captions, transcript, optional tabs, related resources, and start/end-time behavior.
- `base-offline` already overrides `video.html` and `video_player.html` in the theme chain. Verify these work correctly when called from `resource_body_v3.html` (v3 call chain may differ from v2).
- **Highest-risk step**: any change to shared video helpers in `base-offline/` affects both offline themes.
- **Regression**: `tests-e2e/ocw-ci-test-course/video.spec.ts`, `video-tabs.spec.ts`, and `tests-e2e/ocw-ci-test-course-v3/video-view-v3.spec.ts` must all pass.

### 15. External-resource behavior
- Goal: preserve correct external-link behavior without breaking local navigation.
- Cover nav items backed by external-resource content and `/pages/external-resources-page`.
- Keep the warning modal/new-tab behavior for true external URLs while ensuring internal links remain package-local.
- **Likely already covered**: `course-offline-v3/layouts/partials/nav_item.html` already handles `external-resource` content type in the nav. Primary remaining work is E2E validation.
- **Regression**: `tests-e2e/ocw-ci-test-course/external-resources.spec.ts` must still pass.

### 16. Final parity sweep
- Goal: finish with a stable minimum offline-v3 lane, not a spike.
- Add remaining offline-v3 E2E coverage for page families not yet covered by existing specs.
- Keep the online v3 suite unchanged; add offline-specific assertions only where behavior intentionally differs.
- Use failures to decide the smallest remaining override set inside `course-offline-v3`.
- **Must-green gate**: all four theme lanes (`course-v2` online, `course-v2` offline, `course-v3` online, `course-v3` offline) must pass before this step is complete.

#### Existing vs Remaining E2E Coverage
| Route | Existing Spec | Status |
|---|---|---|
| `/` | `smoke-v3-offline.spec.ts` | ✅ Covered |
| `/pages/assignments` | `smoke-v3-offline.spec.ts` | ✅ Covered |
| `/pages/syllabus` | `generic-content-pages.spec.ts` | ✅ Covered |
| `/pages/section-1` | `generic-content-pages.spec.ts` | ✅ Covered |
| `/pages/subsection-1a` | `generic-content-pages.spec.ts` | ✅ Covered |
| `/pages/subsection-1b` | `generic-content-pages.spec.ts` | ✅ Covered |
| `/pages/first-test-page-title` | `generic-content-pages.spec.ts` | ✅ Covered |
| `/pages/second-test-page` | `generic-content-pages.spec.ts` | ✅ Covered |
| `/pages/subscripts-and-superscripts` | `routing-v3-offline.spec.ts` (link only) | ⚠️ Partial |
| `/pages/shortcode-demos` | `routing-v3-offline.spec.ts` (link only) | ⚠️ Partial |
| `/pages/video-series-overview` | `routing-v3-offline.spec.ts` (link only) | ⚠️ Partial |
| `/pages/multiple-videos-series-overview` | — | ❌ Missing |
| `/pages/quiz-demo` | — | ❌ Missing |
| `/pages/image-gallery` | — | ❌ Missing |
| `/lists/a-resource-list` | `smoke-v3-offline.spec.ts` + `routing-v3-offline.spec.ts` | ✅ Covered |
| `/download` | `routing-v3-offline.spec.ts` | ✅ Covered |
| `/resources/file_pdf` | `smoke-v3-offline.spec.ts` | ✅ Covered |
| `/resources/example_pdf` | — | ❌ Missing |
| `/resources/example_jpg` | — | ❌ Missing |
| `/resources/example_notes` | — | ❌ Missing |
| `/video_galleries/lecture-videos` | — | ❌ Missing |
| `/resources/ocw_test_course_mit8_01f16_l01v01_360p` | — | ❌ Missing |
| `/resources/ocw_test_course_mit8_01f16_l26v02_360p` | — | ❌ Missing |
| `/pages/external-resources-page` | — | ❌ Missing |

## Route Matrix
| Step | Primary fixtures |
| --- | --- |
| 1 | `/`, `/pages/assignments`, `/resources/file_pdf` |
| 2 | `/`, `/pages/assignments`, `/lists/a-resource-list`, `/resources/file_pdf` |
| 3 | `/pages/subscripts-and-superscripts`, `/pages/shortcode-demos`, `/pages/video-series-overview`, `/lists/a-resource-list`, `/download` |
| 4 | `/`, `/pages/assignments`, `/pages/quiz-demo` |
| 5 | `/` |
| 6 | `/pages/assignments`, `/pages/syllabus`, `/pages/section-1`, `/pages/subsection-1a`, `/pages/subsection-1b`, `/pages/first-test-page-title`, `/pages/second-test-page`, `/pages/subscripts-and-superscripts`, `/pages/shortcode-demos` |
| 7 | `/pages/video-series-overview`, `/pages/multiple-videos-series-overview` |
| 8 | `/pages/quiz-demo` |
| 9 | `/pages/image-gallery`, `/pages/shortcode-demos` |
| 10 | `/lists/a-resource-list`, `/download` term groups |
| 11 | `/download` |
| 12 | `/resources/file_pdf`, `/resources/example_pdf`, `/resources/example_jpg`, `/resources/example_notes` |
| 13 | `/video_galleries/lecture-videos` |
| 14 | `/resources/ocw_test_course_mit8_01f16_l01v01_360p`, `/resources/ocw_test_course_mit8_01f16_l26v02_360p` |
| 15 | `/pages/external-resources-page` |
| 16 | All representative routes above |

## Public Interface / Config Changes
- New theme: `course-offline-v3` — **exists**.
- New dedicated webpack bundle `course_offline_v3` — **exists**.
- New local E2E site alias `course-v3-offline` — **exists**.
- New env/config path `COURSE_V3_OFFLINE_HUGO_CONFIG_PATH` — **exists**.
- No content-model or schema changes are planned.

## Test Plan
- Build offline v3 from `test-sites/ocw-ci-test-course`.
- Smoke-test asset loading, local navigation, and one representative route from each page family.
- After every implementation step, run the required regression gate:
  - build the existing `course-v2` offline site
  - run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes
  - expand the regression suite when the step changes shared helpers, shared partials, webpack/env wiring, or test harness code
- Add parity coverage for these fixture routes:
  - `/`
  - `/pages/assignments`
  - `/pages/syllabus`
  - `/pages/subscripts-and-superscripts`
  - `/pages/quiz-demo`
  - `/pages/video-series-overview`
  - `/pages/multiple-videos-series-overview`
  - `/pages/image-gallery`
  - `/pages/shortcode-demos`
  - `/lists/a-resource-list`
  - `/download`
  - representative `/resources/*` pages
  - `/video_galleries/lecture-videos`
  - `/pages/external-resources-page`
- Explicitly assert offline-only deltas:
  - internal navigation resolves to local pages
  - file downloads resolve to local packaged files
  - redundant course-download CTAs are removed or relabeled
  - remote-media and remote-thumbnail behavior has local fallback

## Historical Note
- `course-v3` and `course-offline-v3` previously existed, were later removed in release `1.85.2`, and should be treated as a reintroduction path rather than a greenfield invention.
- Release notes also record adjacent offline fixes such as removing the offline download button and fixing offline video-gallery item URLs, which are useful signals for likely regression areas.

## Assumptions / Defaults
- [master-plan.md](./master-plan.md) remains the canonical top-level index.
- [project-context.md](./project-context.md) is the shared memory document for this effort.
- Shared fixes that help both offline themes should go into `base-offline`; `course-offline-v3` should only keep v3-specific overrides.
- The shared test course in `test-sites/ocw-ci-test-course` remains the content fixture for online and offline v3 parity.
- Steps 07-09 (embedded resources, quiz, image gallery) are parallelizable — they are independent content-page subtypes with a shared regression gate after all three complete.
- `course-offline-v3/` does not need a `go.mod` file; it inherits module identity via the Hugo theme chain.
