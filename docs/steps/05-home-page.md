# Step 05: Home Page

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Make `/` a stable offline entry point using the v3 home layout and offline-appropriate calls to action.

## Assumes Complete
- Steps 01 through 04 are complete.
- Inherited invariants:
  - Offline-safe helper routing is already in place.
  - Offline-v3 now uses the v3 bundle and shared chrome.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- `course-v3/layouts/home.html` renders the homepage using v3 header, nav, course detail, course image, licensing, and `download_course_link_button`.
- The bottom CTA and some panel CTAs still use the v3 online “Download Course” messaging path.
- The homepage is the main offline entry point and should direct users into the packaged course, not back to a redundant course-download action.

## Read Only These Files
- `course-v3/layouts/home.html`
- `course-v3/layouts/partials/course_detail.html`
- `course-v3/layouts/partials/course_description.html`
- `course-v3/layouts/partials/course_info.html`
- `course-v3/layouts/partials/course_image_section.html`
- `course-v3/layouts/partials/download_course_link_button.html`
- `course-offline/layouts/partials/download_course_link_button.html`
- `course-offline-v3` overrides related to homepage chrome or CTAs

## Expected Edit Set
- `course-offline-v3/layouts/home.html` only if a full-page override is unavoidable
- Prefer targeted overrides:
  - `course-offline-v3/layouts/partials/download_course_link_button.html`
  - any homepage-specific partial overrides needed for offline CTA behavior

## Implementation Tasks
1. Reuse the v3 home layout as the baseline. Do not fork the homepage unless a partial-level override cannot isolate the offline behavior.
2. Change homepage CTA behavior so “Download Course” becomes an offline browse/resource entry point. Prefer language such as “Browse Resources” if that fits existing offline conventions.
3. Keep course description, course info, topics, course image, and learning resource type content unchanged from the v3 structure.
4. Verify that homepage expander behavior and course-info rendering still work with the offline-v3 bundle.
5. Ensure all homepage links remain inside the offline package.

## Invariants / Do Not Change
- Do not change homepage content structure beyond what is needed for offline CTAs and local links.
- Do not solve generic page issues here; limit scope to `/`.
- Do not blank the CTA area. If the online CTA becomes inappropriate offline, replace it with a useful offline action.

## Acceptance Routes
- `/`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- Homepage loads with v3 header, banner, nav, course detail, and image structure intact.
- Homepage CTA no longer behaves like an online “download the course” prompt.
- CTA keeps the user inside the offline package, typically by pointing at `/download` or another local browse surface.
- Course description expansion and course-info behavior still work.

## Failure Modes / Stop Conditions
- Stop if making the CTA useful offline requires forking all of `home.html`; prefer smaller partial overrides first.
- Stop if homepage links are still leaking to online-only or root-absolute destinations after the routing step; that indicates step 03 is incomplete.
