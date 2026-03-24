# Step 16: Final Parity Sweep

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Add the full offline-v3 E2E lane and use the failures to reduce the remaining override set to the smallest stable surface.

## Assumes Complete
- Steps 01 through 15 are complete.
- Inherited invariants:
  - Shared offline fixes belong in `base-offline` whenever safe.
  - `course-offline-v3` remains a thin v3-specific layer.
  - No schema or content-model changes are allowed.

## Current Repo Truth
- By this step, offline-v3 should already build, serve in E2E, use the v3 bundle/chrome, and support all identified page families.
- The remaining task is parity tightening and regression catching, not new architecture.
- The online v3 Playwright suite already covers several v3-specific page types and should remain unchanged.

## Read Only These Files
- Existing v3 specs under `tests-e2e/ocw-ci-test-course-v3/`
- Shared specs under `tests-e2e/ocw-ci-test-course/` that cover download, video, external resources, image gallery, shortcodes, course home, course info, and footer behavior
- Offline-v3 smoke spec from step 02
- Any offline-v3-specific specs added during prior steps

## Expected Edit Set
- New offline-v3 Playwright specs
- Small targeted template/helper fixes revealed by the new tests
- Avoid broad structural changes at this point

## Implementation Tasks
1. Add offline-v3 E2E coverage in this order:
   - smoke
   - home
   - generic pages
   - embedded pages
   - quiz
   - image gallery / shortcode pages
   - resource list
   - `/download`
   - non-video resource pages
   - video gallery
   - video detail pages
   - external resources
2. Reuse existing online v3 and shared v2/offline test intent where possible instead of inventing new assertions from scratch.
3. Add offline-specific assertions only where behavior intentionally differs:
   - local page URLs
   - local file downloads
   - offline browse CTA wording
   - remote-media/thumbnail fallback
4. Use failing tests to identify the smallest remaining override/helper fix needed. Prefer tightening shared helpers over forking large templates late in the effort.
5. Stop once the minimal offline-v3 lane is stable and the override theme is still thin.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not rewrite the online v3 test suite to accommodate offline-v3.
- Do not respond to late failures by forking entire v3 layouts unless a targeted helper/partial fix is impossible.
- Keep shared offline fixes in `base-offline` whenever they benefit both offline themes.

## Acceptance Routes
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
- `/resources/file_pdf`
- `/resources/example_pdf`
- `/resources/example_jpg`
- `/resources/example_notes`
- `/video_galleries/lecture-videos`
- `/resources/ocw_test_course_mit8_01f16_l01v01_360p`
- `/resources/ocw_test_course_mit8_01f16_l26v02_360p`
- `/pages/external-resources-page`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- Asset loading works across the offline-v3 site.
- Internal navigation remains local on all page families.
- File downloads resolve to local packaged files.
- `/download` behaves like an offline browse surface, not an online course-download CTA.
- Video gallery pages tolerate missing remote thumbnails through a local fallback.
- Video detail pages, embedded videos, transcripts, captions, and related tabs all work through offline-safe paths.
- External-resource behavior preserves warnings/new-tab handling for true external URLs only.

## Failure Modes / Stop Conditions
- Stop if broad template forks are becoming the default reaction to test failures. Re-evaluate whether a shared helper or smaller partial override can solve the issue.
- Stop if offline-v3 fixes are starting to diverge enough that `course-offline-v3` is becoming a fork of `course-v3`; document the drift and reassess the architecture before continuing.
