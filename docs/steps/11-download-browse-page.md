# Step 11: Download / Browse Page

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Convert `/download` from the online download CTA surface into a useful offline browse/download page.

## Assumes Complete
- Steps 01 through 10 are complete.
- Inherited invariants:
  - Resource-list cards already resolve locally.
  - Shared routing and download helpers are already offline-safe.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- `/download` is rendered through the v3 learning-resource-type taxonomy path.
- `course-v3/layouts/partials/resources_header.html` and `download_course_link_button.html` are oriented around the online “Download Course” experience.
- The old v2 offline theme blanked `resources_header.html`, but the final offline-v3 state should not leave this area empty.

## Read Only These Files
- `course-v3/layouts/learning_resource_types/taxonomy.html`
- `course-v3/layouts/learning_resource_types/term.html`
- `course-v3/layouts/partials/resources_header.html`
- `course-v3/layouts/partials/download_course_link_button.html`
- `course-offline/layouts/partials/resources_header.html`
- `course-offline/layouts/partials/download_course_link_button.html`
- `course-v3/layouts/partials/resource_list_collapsible.html`

## Expected Edit Set
- `course-offline-v3/layouts/partials/resources_header.html`
- `course-offline-v3/layouts/partials/download_course_link_button.html`
- Possibly a small taxonomy/term override only if the header area cannot be solved by partial overrides

## Implementation Tasks
1. Keep the v3 grouped learning-resource-type list structure and ordering intact.
2. Replace the online zip-download message/button area with offline-specific heading and instructions that explain this page is the browse/download surface for the packaged course.
3. Make sure every list entry leads either to:
   - a local resource page, or
   - a local file download
4. Remove or relabel redundant “Download Course” language so it no longer suggests downloading a course the user already has.
5. Keep the page visually aligned with the v3 taxonomy/list structure rather than regressing to a v2-only layout.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not leave the header area blank in the final state.
- Do not remove the grouped/collapsible resource-list structure.
- Do not introduce a second download/browse concept separate from `/download`.

## Acceptance Routes
- `/download`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

### Regression Spec Matrix
| Spec file | Theme | Must pass | Why |
|---|---|---|---|
| `ocw-ci-test-course/download.spec.ts` | course (v2) | ✅ | Shared download/taxonomy partials |
| `ocw-ci-test-course/resource-list.spec.ts` | course (v2) | ✅ | Collapsible list behavior |
| `ocw-ci-test-course-v3-offline/smoke-v3-offline.spec.ts` | offline-v3 | ✅ | Baseline health |

### New Offline-v3 Specs Needed
- `download-v3-offline.spec.ts` — covers `/download`: grouped resource lists render, header text is offline-appropriate, no “Download Course” CTA, all items resolve locally.

### Step-Specific Assertions
- `/download` renders grouped collapsible resource lists.
- The page header and instructions are useful in offline context.
- No redundant “Download Course” CTA remains.
- Every listed item resolves to a local page or local file.

## Failure Modes / Stop Conditions
- Stop if the only way to change `/download` is to fork the entire taxonomy flow. Prefer partial overrides first.
- Stop if some list items still point at online URLs; that indicates step 10 or step 03 is incomplete.
