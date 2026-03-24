# Step 09: Image Gallery And Shortcode Pages

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Finish the remaining interactive content patterns that depend on shared shortcodes and offline helpers, especially image gallery behavior and shortcode-generated links.

## Assumes Complete
- Steps 01 through 08 are complete.
- Inherited invariants:
  - Generic pages, embedded resources, and quiz pages are already stable.
  - Offline-safe helper routing is already working.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- `base-offline/layouts/shortcodes/image-gallery.html` already provides an offline gallery override with local base URL behavior and on-load initialization.
- `base-theme/layouts/shortcodes/resource_link.html` is a known routing hotspot because it currently uses raw `.Permalink`.
- `shortcode-demos` exercises shortcode-generated resource links.
- `image-gallery` is the dedicated fixture for local gallery behavior.

## Read Only These Files
- `base-offline/layouts/shortcodes/image-gallery.html`
- `base-theme/layouts/shortcodes/image-gallery.html`
- `base-theme/layouts/shortcodes/image-gallery-item.html`
- `base-theme/layouts/shortcodes/resource_link.html`
- `course-offline-v3` bundle entrypoint
- `test-sites/ocw-ci-test-course/content/pages/image-gallery.md`
- `test-sites/ocw-ci-test-course/content/pages/shortcode-demos.md`

## Expected Edit Set
- `base-offline/layouts/shortcodes/image-gallery.html` only if gallery initialization or base URL handling needs refinement
- `base-theme/layouts/shortcodes/resource_link.html` or an offline-safe override path
- `course-offline-v3` bundle entrypoint only if gallery JS init is still missing

## Implementation Tasks
1. Validate that the offline gallery shortcode remains the active render path in offline-v3.
2. Confirm gallery assets initialize locally and do not depend on online asset lookup.
3. Ensure gallery base URLs resolve through offline-safe helpers rather than root-relative or remote paths.
4. Verify shortcode-generated resource links in `shortcode-demos` are local, correctly formatted, and free of spacing/markup regressions.
5. Keep fixes shared where possible. Only add a v3-specific override if the shared base behavior cannot be corrected safely.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not fork page layouts for gallery or shortcode support.
- Do not regress generic content-page behavior already validated in prior steps.
- Keep the existing gallery feature set; this step is about offline correctness, not redesign.

## Acceptance Routes
- `/pages/image-gallery`
- `/pages/shortcode-demos`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- Image gallery renders and initializes locally.
- Gallery controls and viewer behavior work without online dependencies.
- Gallery resource/credit links remain correct.
- Shortcode-generated resource links resolve locally and preserve readable inline formatting.

## Failure Modes / Stop Conditions
- Stop if gallery behavior now depends on bundle imports that were not preserved in step 04; restore the required initialization before editing shortcode markup.
- Stop if `resource_link` fixes would break online behavior; isolate them behind an offline override path rather than changing global behavior blindly.
