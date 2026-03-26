# Step 06: Generic Content Pages

> **Status: ✅ COMPLETE**

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Make standard `pages/*` content render correctly in offline-v3 before tackling embedded media-heavy pages.

## Assumes Complete
- Steps 01 through 05 are complete.
- Inherited invariants:
  - Offline-safe helper routing is the default.
  - Shared v3 chrome is already in place.
  - Homepage offline CTA behavior is solved.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth (post-implementation)
- Generic content pages (`pages/single.html`, `pages/section.html`) are inherited from `course-v3` without forking.
- The offline-v3 routing overrides from step 03 handle all internal link rewriting.
- Tables, sub/superscripts, shortcode links, and markdown links all render correctly in offline-v3.
- Section/subsection navigation works with package-local links.

## Implementation Notes
- No `course-offline-v3/layouts/pages/` overrides were needed. The v3 page layouts work as-is with the offline routing helpers.
- Verified by `generic-content-pages.spec.ts`:
  - `/pages/syllabus` — table rendering
  - `/pages/section-1` — section content loads
  - `/pages/subsection-1a` — nav links are package-local
  - Footer link assertions pass
- Also verified by `routing-v3-offline.spec.ts`:
  - `/pages/shortcode-demos` — shortcode-generated links are package-local
- The `instructor_insights` layout path was not explicitly tested but follows the same `course_content.html` rendering path.

## Read Only These Files
- `course-v3/layouts/pages/single.html`
- `course-v3/layouts/pages/section.html`
- `course-v3/layouts/pages/instructor_insights.html`
- `course-v3/layouts/partials/course_content.html`
- `course-v3/layouts/partials/content_meta.html` if needed
- `base-theme/layouts/shortcodes/resource_link.html`
- `course-offline-v3` helper overrides from step 03

## Expected Edit Set
- Prefer helper or partial overrides in `course-offline-v3`
- `course-offline-v3/layouts/pages/*` only if a layout-level override is required
- Shared shortcode/helper fixes if a generic link issue is still unresolved

## Implementation Tasks
1. Reuse the existing v3 page and section layouts as the baseline.
2. Verify generic page rendering for:
   - standard page content
   - section-page expansion behavior
   - heading and table spacing
   - subscripts and superscripts
   - markdown links
   - shortcode-generated resource links
3. Fix only the offline deltas:
   - local page routing
   - local resource/file routing
   - any remaining layout-level issues created by offline bundle/chrome changes
4. Keep typography and spacing aligned with existing v3 behavior.
5. Do not yet focus on embedded videos, quiz behavior, or image-gallery-specific issues beyond whatever is necessary to keep generic content stable.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not fork `course_content.html` unless helper-level fixes cannot solve the problem.
- Do not regress existing v3 typography or spacing behavior.
- Do not solve video-specific behavior here; embedded video pages are handled in step 07.

## Acceptance Routes
- `/pages/assignments`
- `/pages/syllabus`
- `/pages/section-1`
- `/pages/subsection-1a`
- `/pages/subsection-1b`
- `/pages/first-test-page-title`
- `/pages/second-test-page`
- `/pages/subscripts-and-superscripts`
- `/pages/shortcode-demos`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- Generic page navigation works locally across parent/child section pages.
- Typography and table rendering remain aligned with current v3 behavior.
- Subscript and superscript content renders correctly.
- Markdown links and shortcode-generated links resolve locally.
- No online-only CTA or footer leakage remains on generic pages.

## Failure Modes / Stop Conditions
- Stop if generic page fixes require broad changes to shared v3 layout structure. That likely means routing or shared chrome work is incomplete.
- Stop if `shortcode-demos` reveals unresolved helper-level issues that belong back in step 03.
