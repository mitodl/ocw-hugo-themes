# Step 02: Offline Build And E2E Plumbing

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Make offline-v3 a first-class local test target in the existing Playwright and `LocalOcw` workflow.

## Assumes Complete
- Step 01 is complete.
- Inherited invariants:
  - `course-offline-v3` exists and remains a thin bootstrap theme.
  - No page-specific behavior changes have been made yet.
  - No schema or content-model changes are allowed.

## Current Repo Truth
- `.env` contains `COURSE_V3_HUGO_CONFIG_PATH` but no offline-v3-specific env var.
- `tests-e2e/util/test_sites.ts` defines only `course`, `course-v3`, and `www`.
- `tests-e2e/LocalOcw.ts` already builds all aliases from `TEST_SITES`, so adding a new alias is the correct integration point.
- The test content for both online and offline v3 should continue to be `test-sites/ocw-ci-test-course`.

## Read Only These Files
- `.env`
- `tests-e2e/util/test_sites.ts`
- `tests-e2e/LocalOcw.ts`
- `tests-e2e/util/CoursePage.ts`
- `tests-e2e/README.md`
- `../ocw-hugo-projects/ocw-course-v3/config-offline.yaml`

## Expected Edit Set
- `.env` or env-loading code if a dedicated offline-v3 config path is required
- `tests-e2e/util/test_sites.ts`
- New offline-v3 smoke test under `tests-e2e/`
- Possibly `tests-e2e/util/CoursePage.ts` only if alias typing or helper logic requires a small extension

## Implementation Tasks
1. Introduce a dedicated offline-v3 config path in local env handling. Prefer a new `COURSE_V3_OFFLINE_HUGO_CONFIG_PATH` rather than overloading the online v3 config.
2. Extend `TestSiteAlias` and `TEST_SITES` with a new offline-v3 entry that:
   - reuses `contentDir: "ocw-ci-test-course"`
   - uses the offline-v3 Hugo config path
   - builds to a distinct site name such as `ocw-ci-test-course-v3-offline`
3. Keep `LocalOcw` unchanged unless alias typing or display logic requires a small edit. Its existing `buildAllSites()` behavior should pick up the new alias automatically.
4. Add a smoke spec for offline-v3 that exercises:
   - home page load
   - one generic page
   - one list page
   - one resource page
5. Use the same local server and fixture infrastructure as the rest of Playwright. Do not invent a separate serve path for offline-v3.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not merge offline-v3 into the existing online `course-v3` alias.
- Do not add page-specific parity assertions yet.
- Do not change the existing online v3 tests in this step.
- Keep the new smoke coverage minimal and targeted at integration health.

## Acceptance Routes
- `/`
- `/pages/assignments`
- `/lists/a-resource-list`
- `/resources/file_pdf`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- `LocalOcw.buildAllSites()` builds offline-v3 alongside the existing sites.
- `siteUrl()` can produce URLs for the offline-v3 site alias.
- The offline-v3 smoke spec visits the four representative routes successfully.
- The smoke spec only asserts build/integration health, not final offline parity.

## Failure Modes / Stop Conditions
- Stop if the offline-v3 build path collides with the existing online v3 output path.
- Stop if alias typing changes cascade into broad helper changes outside `test_sites.ts` and `CoursePage.ts`; that would indicate a larger harness assumption that must be documented first.
