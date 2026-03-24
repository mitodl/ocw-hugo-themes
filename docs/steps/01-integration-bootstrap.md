# Step 01: Integration Bootstrap

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Create `course-offline-v3` as a separately owned offline theme and make the configured offline-v3 Hugo stack build for the first time.
- This step is about bootstrapping only. A v2-looking render is acceptable as long as the site builds and representative routes resolve.

## Assumes Complete
- No previous steps.

## Current Repo Truth
- `../ocw-hugo-projects/ocw-course-v3/config-offline.yaml` already points at `base-offline -> course-offline-v3 -> course-v3 -> base-theme`.
- `course-offline-v3/` does not exist in this repo yet.
- `course-offline/` already contains the existing offline theme bootstrap and should be copied before the new directory is inspected or edited.
- `base-theme/assets/webpack/webpack.common.ts` has a `course_offline` entry but no `course_offline_v3`.
- The current offline asset references in `course-offline/layouts/partials/basejs.html` and `course-offline/layouts/partials/extrahead.html` point at `course_offline` assets.

## Read Only These Files
- `course-offline/assets/course-offline.ts`
- `course-offline/layouts/partials/basejs.html`
- `course-offline/layouts/partials/extrahead.html`
- `course-offline/layouts/partials/extrajs.html`
- `base-theme/assets/webpack/webpack.common.ts`
- `../ocw-hugo-projects/ocw-course-v3/config-offline.yaml`

## Expected Edit Set
- New directory: `course-offline-v3/` created by copying `course-offline/`
- `base-theme/assets/webpack/webpack.common.ts`
- `course-offline-v3/layouts/partials/basejs.html`
- `course-offline-v3/layouts/partials/extrahead.html`
- `course-offline-v3/assets/course-offline.ts` or renamed offline-v3 entrypoint if needed for clarity

## Implementation Tasks
1. Duplicate `course-offline/` into `course-offline-v3/` before opening the new directory contents. Treat the copy as a bootstrap snapshot, not a finished implementation.
2. Add a dedicated `course_offline_v3` webpack entry and output asset names in `webpack.common.ts`. Do not reuse `course_offline`.
3. Update the copied `basejs.html` and `extrahead.html` so `course-offline-v3` loads the new offline-v3 asset names.
4. Keep the sibling offline Hugo config unchanged unless the build proves it is wrong.
5. Build the offline-v3 site using the existing offline-v3 Hugo config and confirm that the new theme is discoverable by Hugo and that CSS/JS assets are emitted with the new bundle name.
6. Do not attempt page-type parity, routing cleanup, or v3 visual convergence in this step. The only goal is to get a successful build with the new theme wired in.

## Invariants / Do Not Change
- Do not edit `course-v3` layouts yet.
- Do not implement v3 bundle convergence yet.
- Do not start page-specific overrides yet.
- Do not introduce schema or content-model changes.
- Keep `course-offline-v3` as a copy-plus-minimal-wiring bootstrap, not a large custom theme.

## Acceptance Routes
- `/`
- `/pages/assignments`
- `/resources/file_pdf`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- Hugo build using `ocw-course-v3/config-offline.yaml` succeeds.
- Generated HTML references `course_offline_v3` CSS and JS assets rather than `course_offline`.
- Representative routes load without missing-layout or missing-asset failures.
- No visual parity assertions are required yet.

## Failure Modes / Stop Conditions
- Stop if the sibling offline config no longer points at `course-offline-v3`; document the mismatch before changing config.
- Stop if the copied theme cannot emit separate asset names without breaking the existing v2 offline theme. That would require revisiting webpack ownership before proceeding.
- Do not continue to later steps until the build works with `course-offline-v3` present.
