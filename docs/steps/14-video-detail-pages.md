# Step 14: Video Detail Pages

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Finish the highest-complexity page family by making full v3 video resource pages work end-to-end offline.

## Assumes Complete
- Steps 01 through 13 are complete.
- Inherited invariants:
  - Shared routing, list pages, non-video resources, and gallery pages already work locally.
  - Embedded video pages already prefer local media when available.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- Video detail pages still render through `course-v3/layouts/resources/single.html` and `base-theme/layouts/partials/resource_body_v3.html`.
- Shared video behavior spans:
  - `base-theme/layouts/partials/video.html`
  - `base-theme/layouts/partials/video_embed.html`
  - `base-theme/layouts/partials/local_video_player.html`
  - `base-theme/layouts/partials/youtube_player.html`
  - `base-offline/layouts/partials/video.html`
  - `base-offline/layouts/partials/video_player.html`
- Representative fixtures include a primary lecture video and a no-instructor-variant lecture video.

## Read Only These Files
- `course-v3/layouts/resources/single.html`
- `base-theme/layouts/partials/resource_body_v3.html`
- `base-theme/layouts/partials/video.html`
- `base-theme/layouts/partials/video_embed.html`
- `base-theme/layouts/partials/local_video_player.html`
- `base-theme/layouts/partials/youtube_player.html`
- `base-theme/layouts/partials/video_expandable_tab.html`
- `base-offline/layouts/partials/video.html`
- `base-offline/layouts/partials/video_player.html`
- representative video resource content files in `test-sites/ocw-ci-test-course/content/resources/`

## Expected Edit Set
- Prefer shared video helper fixes in `base-offline`
- `course-offline-v3` overrides only where v3-specific page structure requires it
- Possibly targeted overrides in `resource_body_v3` call sites if an offline-only branch must be introduced

## Implementation Tasks
1. Keep the v3 video-page structure from `resource_body_v3` as the baseline.
2. Ensure local packaged MP4 playback is the preferred path whenever a local file is available.
3. Preserve the offline warning/fallback path for cases where only external playback is possible.
4. Validate the full video-page feature set:
   - player render
   - captions
   - transcript
   - optional tab
   - related resources tab
   - start/end-time behavior
5. Confirm embedded-page links into these video detail pages are already local and still work.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not fork the entire v3 video page if shared helper fixes can solve the behavior.
- Do not remove transcript, captions, related resources, or optional-tab support.
- Do not prioritize YouTube over packaged local media when local media exists.

## Acceptance Routes
- `/resources/ocw_test_course_mit8_01f16_l01v01_360p`
- `/resources/ocw_test_course_mit8_01f16_l26v02_360p`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

### Regression Spec Matrix
| Spec file | Theme | Must pass | Why |
|---|---|---|---|
| `ocw-ci-test-course/video.spec.ts` | course (v2) | ✅ | Shared video partials |
| `ocw-ci-test-course/video-tabs.spec.ts` | course (v2) | ✅ | Video tab behavior |
| `ocw-ci-test-course-v3/video-view-v3.spec.ts` | course-v3 | ✅ | v3 video page structure |
| `ocw-ci-test-course-v3-offline/smoke-v3-offline.spec.ts` | offline-v3 | ✅ | Baseline health |
| `ocw-ci-test-course-v3-offline/routing-v3-offline.spec.ts` | offline-v3 | ✅ | Embedded video link locality |

### New Offline-v3 Specs Needed
- `video-detail-v3-offline.spec.ts` — covers `/resources/ocw_test_course_mit8_01f16_l01v01_360p` and `/resources/ocw_test_course_mit8_01f16_l26v02_360p`: local MP4 playback, captions/transcript locality, optional tab, related resources tab, no-instructor variant.

### Step-Specific Assertions
- Video resource pages render with the v3 structure intact.
- Local video playback works when packaged media is present.
- Captions and transcript links resolve through local/offline-safe paths.
- Optional tab and related resources render correctly when present.
- No-instructor variant behavior does not regress layout or metadata rendering.

## Failure Modes / Stop Conditions
- Stop if video detail pages require a divergence between embedded-video behavior and full video-page behavior that cannot be expressed through shared helpers. Document the exact split before adding v3-specific overrides.
- Stop if transcript or captions links still resolve to online-only paths; that indicates shared helper work is incomplete.
