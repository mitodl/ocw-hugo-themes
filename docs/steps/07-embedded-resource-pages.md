# Step 07: Embedded Resource Pages

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Support pages that embed video resources inside normal markdown pages and make sure their secondary links stay offline-safe.

## Assumes Complete
- Steps 01 through 06 are complete.
- Inherited invariants:
  - Generic content pages are stable.
  - Offline-safe helper routing is already working.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- Embedded resource pages rely on `base-theme/layouts/shortcodes/resource.html`.
- Video resources rendered through that shortcode eventually flow into `video_embed.html` and shared video partials.
- `video_embed.html` already uses helper-based page routing for “View video page”, which is the correct offline-safe path to preserve.

## Read Only These Files
- `base-theme/layouts/shortcodes/resource.html`
- `base-theme/layouts/partials/video_embed.html`
- `base-theme/layouts/partials/video.html`
- `base-theme/layouts/partials/local_video_player.html`
- `base-theme/layouts/partials/youtube_player.html`
- `base-offline/layouts/partials/video.html`
- `base-offline/layouts/partials/video_player.html`
- `test-sites/ocw-ci-test-course/content/pages/video-series-overview.md`
- `test-sites/ocw-ci-test-course/content/pages/multiple-videos-series-overview.md`

## Expected Edit Set
- Prefer shared offline video helpers in `base-offline`
- `course-offline-v3` overrides only if the embedded behavior is v3-specific
- Possibly a small shared shortcode/partial adjustment if helper routing is still bypassed

## Implementation Tasks
1. Validate the embedded resource render path end-to-end from shortcode to video partials.
2. Ensure embedded resources prefer local/offline media when a packaged local video is present.
3. Preserve the offline warning/fallback path for YouTube-backed media when no local packaged file exists.
4. Verify the following embedded secondary links remain local and correct:
   - “View video page”
   - download links
   - transcript links
   - captions links
   - start/end-time behavior where present
5. Confirm repeated embeds on one page work without duplicate-ID or initialization regressions.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not fork generic page layouts in this step.
- Do not change the meaning of the shared `resource` shortcode.
- Do not remove the YouTube fallback warning path; only demote it behind local media when available.

## Acceptance Routes
- `/pages/video-series-overview`
- `/pages/multiple-videos-series-overview`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

### Regression Spec Matrix
| Spec file | Theme | Must pass | Why |
|---|---|---|---|
| `ocw-ci-test-course/video.spec.ts` | course (v2) | ✅ | Shared `video_embed.html`, `video.html` |
| `ocw-ci-test-course/video-tabs.spec.ts` | course (v2) | ✅ | Shared video tab partials |
| `ocw-ci-test-course/shortcodes.spec.ts` | course (v2) | ✅ | Shared `resource.html` shortcode |
| `ocw-ci-test-course-v3/video-view-v3.spec.ts` | course-v3 | ✅ | v3 video page rendering |
| `ocw-ci-test-course-v3-offline/routing-v3-offline.spec.ts` | offline-v3 | ✅ | Embedded video link locality |
| `ocw-ci-test-course-v3-offline/smoke-v3-offline.spec.ts` | offline-v3 | ✅ | Baseline health |

### New Offline-v3 Specs Needed
- `embedded-resources-v3-offline.spec.ts` — covers `/pages/video-series-overview` and `/pages/multiple-videos-series-overview`: player render, “View video page” link locality, download/transcript/captions link locality, repeated embeds on single page.

### Step-Specific Assertions
- Embedded video blocks render on both overview pages.
- “View video page” links resolve locally.
- Download, transcript, and captions links resolve locally or through the intended offline-safe helper path.
- Repeated embeds on a single page do not collide or break initialization.
- Local media is used when available; offline warning/fallback appears only when local media is genuinely unavailable.

## Failure Modes / Stop Conditions
- Stop if embedded pages reveal a deeper problem in shared offline video helper ownership. That belongs in `base-offline` before page-specific template overrides.
- Stop if repeated embeds require invasive changes to v3 page layouts rather than shared video/embed partials.
