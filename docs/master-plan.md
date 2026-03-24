# Minimal Workable `course-v3` Offline Theme Plan

## Summary
- Goal: get a buildable, navigable offline `course-v3` theme working first for local E2E, then close page-family gaps one page type at a time.
- Final theme stack remains `base-offline -> course-offline-v3 -> course-v3 -> base-theme`; `course-offline-v3` must stay a thin override theme rather than becoming a fork of `course-v3`.
- The implementation is intentionally staged. The first successful offline-v3 build may still look like v2 offline. Visual convergence to v3 happens later.
- This document is the canonical implementation index. Sub-agents should read [project-context.md](./project-context.md) first, then this file, then only their assigned step document in [docs/steps](./steps/).
- A step is not complete when code lands; it is complete only when the validation points in that step document have been implemented and verified.

## Current Repo Truth
- The sibling Hugo project config `../ocw-hugo-projects/ocw-course-v3/config-offline.yaml` already points at the intended theme stack: `["base-offline", "course-offline-v3", "course-v3", "base-theme"]`.
- The repo does not currently contain a `course-offline-v3/` theme directory, so the configured offline-v3 stack cannot build yet.
- [base-theme/assets/webpack/webpack.common.ts](../base-theme/assets/webpack/webpack.common.ts) currently defines `course_offline` but does not define `course_offline_v3`.
- The current offline bundle at [course-offline/assets/course-offline.ts](../course-offline/assets/course-offline.ts) is still a v2-oriented entrypoint and imports `course-v2` CSS/JS.
- The local development env currently has `COURSE_V3_HUGO_CONFIG_PATH` in [.env](../.env), but no dedicated offline-v3 env var.
- [tests-e2e/util/test_sites.ts](../tests-e2e/util/test_sites.ts) currently knows only `course`, `course-v3`, and `www`; there is no offline-v3 test alias.
- [tests-e2e/LocalOcw.ts](../tests-e2e/LocalOcw.ts) already has the right build-and-serve shape to host another course alias once `TEST_SITES` is extended.
- The test content source of truth for this effort is [test-sites/ocw-ci-test-course](../test-sites/ocw-ci-test-course), which already contains the page and resource fixtures needed for online/offline v3 parity.

## Known Offline Hotspots
- [course-v3/layouts/partials/resource_list_item.html](../course-v3/layouts/partials/resource_list_item.html) uses raw `.permalink` for resource-card titles.
- [course-v3/layouts/partials/see_all.html](../course-v3/layouts/partials/see_all.html) uses raw `.permalink` for “See all” links.
- [base-theme/layouts/partials/footer-v3.html](../base-theme/layouts/partials/footer-v3.html) emits root-relative links like `/`, `/about`, `/accessibility`, `/terms`, and `/contact`.
- [base-offline/layouts/partials/get_resource_download_link.html](../base-offline/layouts/partials/get_resource_download_link.html) emits root-absolute `/static_resources/...` URLs for non-video files.
- [base-theme/layouts/shortcodes/resource_link.html](../base-theme/layouts/shortcodes/resource_link.html) uses raw `.Permalink`.
- `course-v3` video gallery cards can depend on remote YouTube thumbnails, which is not acceptable as a hard dependency for packaged offline use.

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

### 1. Integration bootstrap
- Goal: create a separately owned v3 offline theme and get the first buildable output.
- Start execution by copying `course-offline` to `course-offline-v3` byte-for-byte before reading or editing the new directory.
- Keep the existing v3 offline Hugo config and theme stack; do not invent a new project config unless a blocker appears.
- Add a dedicated webpack bundle for the new theme, with new asset names, so v3 offline can diverge without touching v2 offline.
- Accept a v2-looking first render as long as Hugo builds, assets resolve, and representative pages load.

### 2. Offline build and E2E plumbing
- Goal: make offline v3 a first-class local test target.
- Add a new offline-v3 config path to local env handling and a new Playwright site alias, reusing `test-sites/ocw-ci-test-course` content but building to a separate output name.
- Keep the existing `LocalOcw` serving model; only extend it to build and expose the offline-v3 site.
- Add a smoke spec that loads the offline home page, one generic page, one list page, and one resource page.

### 3. Shared offline URL and routing layer
- Goal: make the site portable as an extracted offline package, not just a localhost demo.
- Keep `base-offline` as the shared owner of `page_url`, `resource_url`, `webpack_url`, `site_root_url`, image-gallery, and offline video helpers.
- Keep or port the course-specific offline helpers v3 still needs: `nav_url`, `course_home_page_url`, `get_destination`, and `get_canonical_url`.
- Audit all places where v3 bypasses those helpers, especially resource-card links, “See all” links, shortcode-generated links, embedded “View video page” links, and download links.
- Treat root-absolute `/static_resources/...` outputs as blockers for final portability.

### 4. Shared v3 bundle and chrome convergence
- Goal: move from copied v2 offline behavior to v3-owned CSS/JS and shared v3 chrome, without losing offline-specific behavior.
- Replace copied v2 imports in the new offline bundle with the minimum v3 equivalents: `course-v3` CSS, MIT Learn header JS, mobile course menu JS, v3 expander logic, quiz logic, image-gallery init, and table-rowspan handling.
- Do not import the entire online `course-v3` entrypoint wholesale; keep an offline-owned entry so offline-specific behavior can diverge cleanly.
- Reuse the v3 header, course banner, nav, course-info panels, and footer by default, then override only the parts that break offline navigation.

### 5. Home page
- Goal: make `/` a stable offline entry point.
- Inherit the v3 home layout and keep the course description, course info, topics, learning resource types, and course image blocks.
- Change offline CTA behavior so “Download Course” surfaces become local browse/resource entry points rather than redundant zip-download prompts.
- Verify description expansion and course-info rendering still work with the offline-v3 bundle.

### 6. Generic content pages
- Goal: make standard `pages/*` content correct before tackling media-heavy pages.
- Cover `assignments`, `syllabus`, `section-1`, `subsection-1a`, `subsection-1b`, `first-test-page-title`, `second-test-page`, `shortcode-demos`, `subscripts-and-superscripts`, and any later `instructor_insights` fixture because they share the same rendering path.
- Preserve current v3 spacing and typography behavior, but ensure markdown links and resource links are offline-safe.

### 7. Embedded resource pages
- Goal: support pages that embed video resources inside normal markdown pages.
- Cover `video-series-overview` and `multiple-videos-series-overview`.
- Validate the shared `resource` shortcode path through embedded video rendering, especially the “View video page” link, download links, transcript links, and start/end-time behavior.

### 8. Interactive quiz page
- Goal: preserve quiz behavior on regular content pages.
- Cover `quiz-demo`.
- Keep the offline bundle support for multiple-choice initialization and preserve v3 styling hooks.

### 9. Image gallery and shortcode-heavy pages
- Goal: cover interactive content patterns that rely on shared shortcodes and offline helpers.
- Cover `image-gallery` and shortcode-driven resource-link pages.
- Keep the `base-offline` image-gallery shortcode override and ensure shortcode-generated resource links resolve locally.

### 10. Resource-list pages
- Goal: make list-style resource browsing fully portable offline.
- Cover `/lists/a-resource-list` and learning-resource-type term pages, since both reuse the same list/card partials.
- Override v3 resource-card partials as needed so title links open local resource pages and download links open local files through offline-safe helpers.

### 11. Download / browse page
- Goal: turn the v3 taxonomy-driven download page into a useful offline browse page.
- Cover `/download` and its collapsible learning-resource-type groups.
- Replace the online zip-download message/button area with offline-specific heading/instructions and keep the grouped lists.

### 12. Non-video resource pages
- Goal: make file, PDF, and image resource detail pages work cleanly offline.
- Cover document, image, and generic file resources such as `file_pdf`, `example_jpg`, `example_pdf`, and `example_notes`.
- Validate badge, metadata, download button, PDF viewer, and image-page rendering.

### 13. Video gallery pages
- Goal: make video-gallery landing pages usable offline without relying on remote thumbnails.
- Cover `/video_galleries/lecture-videos`.
- Keep the v3 gallery layout and local card navigation while treating remote YouTube thumbnails as optional.

### 14. Video detail pages
- Goal: finish the highest-complexity page family last.
- Cover representative video resources such as `ocw_test_course_mit8_01f16_l01v01_360p` and `ocw_test_course_mit8_01f16_l26v02_360p`.
- Keep the v3 resource-page structure, but rely on the shared offline video-player stack for local MP4, captions, transcript, optional tabs, related resources, and start/end-time behavior.

### 15. External-resource behavior
- Goal: preserve correct external-link behavior without breaking local navigation.
- Cover nav items backed by external-resource content and `/pages/external-resources-page`.
- Keep the warning modal/new-tab behavior for true external URLs while ensuring internal links remain package-local.

### 16. Final parity sweep
- Goal: finish with a stable minimum offline-v3 lane, not a spike.
- Add offline-v3 E2E coverage in this order: smoke, home, generic pages, embedded pages, quiz, image gallery/shortcodes, resource list, download page, non-video resource page, video gallery, video page, external resources.
- Keep the online v3 suite unchanged; add offline-specific assertions only where behavior intentionally differs.
- Use failures to decide the smallest remaining override set inside `course-offline-v3`.

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
- New theme: `course-offline-v3`.
- New dedicated webpack bundle and asset names for offline v3.
- New local E2E site alias for offline v3.
- New env/config path for the v3 offline Hugo config.
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
- The first working build may still look like v2 offline; that is acceptable until the bundle/chrome convergence step.
- The shared test course in `test-sites/ocw-ci-test-course` remains the content fixture for online and offline v3 parity.
