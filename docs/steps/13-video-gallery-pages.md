# Step 13: Video Gallery Pages

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Make v3 video-gallery landing pages usable offline without requiring remote thumbnails.

## Assumes Complete
- Steps 01 through 12 are complete.
- Inherited invariants:
  - Non-video resources and list surfaces already work locally.
  - Shared routing and media helpers are already in place.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- `course-v3/layouts/video_galleries/list.html` renders `video-gallery-page.html`.
- `video-gallery-item.html` already uses helper-based page routing for card links, which is the correct direction to preserve.
- Thumbnail behavior may depend on remote YouTube thumbnail URLs for some resources.

## Read Only These Files
- `course-v3/layouts/video_galleries/list.html`
- `course-v3/layouts/video_galleries/single.html`
- `course-v3/layouts/partials/video-gallery-page.html`
- `course-v3/layouts/partials/video-gallery-item.html`
- `test-sites/ocw-ci-test-course/content/video_galleries/lecture-videos.md`
- representative video resource front matter used by the gallery

## Expected Edit Set
- `course-offline-v3/layouts/partials/video-gallery-item.html` if needed
- Possibly shared helper/partial support for thumbnail fallback if that can be done cleanly

## Implementation Tasks
1. Keep the v3 gallery layout and local page-card navigation unchanged.
2. Audit thumbnail behavior for offline use:
   - if a local thumbnail exists, use it
   - if not, fall back to a local non-broken placeholder treatment rather than relying on the network
3. Preserve gallery card titles, metadata, and layout.
4. Validate that clicking a gallery card opens the local video resource page.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not redesign the v3 gallery layout.
- Do not introduce network dependence for thumbnails.
- Do not break card-to-video-page navigation that already routes through helper-based URLs.

## Acceptance Routes
- `/video_galleries/lecture-videos`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

### Regression Spec Matrix
| Spec file | Theme | Must pass | Why |
|---|---|---|---|
| `ocw-ci-test-course-v3/video-gallery-v3.spec.ts` | course-v3 | ✅ | v3 gallery layout and card links |
| `ocw-ci-test-course/video.spec.ts` | course (v2) | ✅ | Shared video partials |
| `ocw-ci-test-course-v3-offline/smoke-v3-offline.spec.ts` | offline-v3 | ✅ | Baseline health |

### New Offline-v3 Specs Needed
- `video-gallery-v3-offline.spec.ts` — covers `/video_galleries/lecture-videos`: v3 gallery layout, card links are local, thumbnail fallback for missing remotes, no broken images.

### Step-Specific Assertions
- Gallery page loads with v3 layout intact.
- Card links open local video resource pages.
- Missing remote thumbnails do not produce broken-image behavior as the only outcome.
- Fallback thumbnail treatment remains local and visually acceptable.

## Failure Modes / Stop Conditions
- Stop if gallery thumbnails are sourced from more than one code path and the fallback model is ambiguous; document the competing paths before editing.
- Stop if card navigation is no longer local; that indicates a regression in shared routing rather than a gallery-specific issue.
