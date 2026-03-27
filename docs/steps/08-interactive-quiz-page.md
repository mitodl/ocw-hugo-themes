# Step 08: Interactive Quiz Page

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Preserve interactive quiz behavior on v3 content pages in offline-v3.

## Assumes Complete
- Steps 01 through 07 are complete.
- Inherited invariants:
  - Generic content pages and embedded-resource pages are stable.
  - The offline-v3 bundle already uses v3 JS/CSS.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- `course-v3` owns the quiz DOM shortcodes.
- Quiz behavior depends on JS initialization from the course bundle.
- `quiz-demo` is the existing fixture route for validation.

## Read Only These Files
- `course-v3/layouts/shortcodes/quiz_multiple_choice.html`
- `course-v3/layouts/shortcodes/quiz_choices.html`
- `course-v3/layouts/shortcodes/quiz_choice.html`
- `course-v3/layouts/shortcodes/quiz_solution.html`
- `course-v3/assets/course-v3.tsx`
- `course-offline-v3` bundle entrypoint
- `test-sites/ocw-ci-test-course/content/pages/quiz-demo.md`

## Expected Edit Set
- `course-offline-v3` bundle entrypoint
- Possibly minimal styling/partial overrides only if the quiz UI is visually or behaviorally broken after the bundle switch

## Implementation Tasks
1. Confirm the offline-v3 bundle still imports and initializes the quiz JS used by v3 content pages.
2. Verify quiz DOM produced by the v3 shortcodes still matches the expectations of the JS initializer.
3. Test user flows on `quiz-demo`:
   - answer selection
   - check answer
   - show solution
   - any reset/visibility behavior already expected by the current v3 implementation
4. Make the smallest possible fix if the bundle migration dropped required imports or initialization.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not rewrite quiz markup unless the JS and shortcode contract is actually broken.
- Do not fork generic page layouts or content rendering for quiz support.
- Keep the existing v3 quiz UX unless an offline-specific problem forces a minimal adjustment.

## Acceptance Routes
- `/pages/quiz-demo`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.
### Regression Spec Matrix
| Spec file | Theme | Must pass | Why |
|---|---|---|---|
| `ocw-ci-test-course-v3-offline/smoke-v3-offline.spec.ts` | offline-v3 | ✅ | Baseline health |
| `ocw-ci-test-course-v3-offline/generic-content-pages.spec.ts` | offline-v3 | ✅ | Page rendering not regressed |

### New Offline-v3 Specs Needed
- `quiz-v3-offline.spec.ts` — covers `/pages/quiz-demo`: answer selection, check-answer flow, show-solution flow, v3 quiz UI styling.

### Step-Specific Assertions
- Quiz options are interactive.
- “Check answer” flow works.
- “Show solution” flow works.
- Quiz UI styling still looks like v3 content-page behavior, not a v2 regression.

## Failure Modes / Stop Conditions
- Stop if the quiz JS depends on imports that were removed during the offline-v3 bundle split; restore the missing import rather than patching around symptoms.
- Stop if quiz markup differs between online v3 and offline v3 unexpectedly. That would suggest an unrelated shortcode override drift.
