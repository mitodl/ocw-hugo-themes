# Step 15: External-Resource Behavior

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Preserve correct warning/new-tab behavior for true external destinations without breaking package-local links on mixed pages.

## Assumes Complete
- Steps 01 through 14 are complete.
- Inherited invariants:
  - Internal routing is already local across page types.
  - Media-heavy pages already work offline.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- External-resource behavior relies on shared external link handling and modal/new-tab flows.
- Mixed pages such as `external-resources-page` can contain both true external links and local course links.
- The offline theme must preserve the warning/new-tab pattern for external links while leaving local links untouched.

## Read Only These Files
- `course-v3/layouts/external-resources/single.html`
- `base-theme/layouts/partials/external_resource_link.html`
- `base-theme/layouts/shortcodes/external_resource_link.html`
- `base-theme/layouts/shortcodes/resource_link.html`
- `test-sites/ocw-ci-test-course/content/pages/external-resources-page.md`

## Expected Edit Set
- Prefer shared external-link helper behavior if adjustment is needed
- `course-offline-v3` overrides only if mixed-page behavior differs in offline-v3 specifically

## Implementation Tasks
1. Verify that true external links continue to use the warning modal and new-tab behavior expected by current tests.
2. Verify that internal links on the same page remain local and do not trigger external-link handling.
3. Confirm that nav items backed by external resources still behave as true external destinations.
4. Make only the smallest fix required if helper branching between internal and external URLs is incorrect.

## Invariants / Do Not Change
- Do not disable warnings for true external URLs.
- Do not route true external URLs through local helper rewriting.
- Do not let mixed pages treat local links as external.

## Acceptance Routes
- `/pages/external-resources-page`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- External links still open through the warning/new-tab path.
- Internal links on the same page stay package-local.
- Mixed-content pages distinguish internal and external destinations correctly.

## Failure Modes / Stop Conditions
- Stop if internal links are still being classified as external after step 03 routing fixes; that suggests URL-shape assumptions need to be rechecked before patching the modal logic.
- Stop if fixing mixed pages would break shared online behavior; isolate the change for offline-v3 only.
