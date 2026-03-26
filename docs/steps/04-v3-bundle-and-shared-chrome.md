# Step 04: V3 Bundle And Shared Chrome

> **Status: ✅ COMPLETE**

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Move the copied offline bundle from v2 imports to the minimum v3 CSS/JS and shared v3 chrome needed for offline-v3, while preserving offline-specific control of the entrypoint.

## Assumes Complete
- Steps 01 through 03 are complete.
- Inherited invariants:
  - Offline-safe helper routing is the default path.
  - `course-offline-v3` remains a thin override theme.
  - No schema or content-model changes are allowed.

## Current Repo Truth (post-implementation)
- `course-offline-v3/assets/course-offline.ts` imports v3 CSS and JS (not v2).
- `course-offline-v3/layouts/partials/basejs.html` references `course_offline_v3.js`.
- `course-offline-v3/layouts/partials/extrahead.html` references `course_offline_v3.css` and `common.css`.
- `course-offline-v3/layouts/partials/extrajs.html` is empty (no analytics).
- `course-offline-v3/layouts/partials/extraheader.html` exists (no search icon).
- `course-offline-v3/layouts/partials/download_course_link_button.html` overrides the CTA.
- `base-theme/layouts/partials/footer-v3.html` still has hard-coded root-relative URLs — this is a known remaining issue.

## Implementation Notes
- The offline-v3 entrypoint imports v3 CSS/JS directly rather than copying the files. This keeps the bundle aligned with online v3 while remaining separately owned.
- MathJax conditional loading is inherited from `course-v3`'s baseof block.
- Footer-v3 hard-coded URLs were NOT fully resolved in this step. An `extrajs.html` strip-links approach or a footer override may be needed in a later step.
- `extraheader.html` was added as an empty override to suppress the search icon in offline mode.

## Read Only These Files
- `course-offline-v3/assets/course-offline.ts` or its offline-v3 entrypoint equivalent
- `course-v3/assets/course-v3.tsx`
- `course-v3/layouts/home.html`
- `course-v3/layouts/_default/baseof.html`
- `course-v3/layouts/partials/header.html`
- `course-v3/layouts/partials/mobile_course_menu_v3.html`
- `course-v3/layouts/partials/course_banner.html`
- `base-theme/layouts/partials/footer-v3.html`
- `course-offline-v3/layouts/partials/basejs.html`
- `course-offline-v3/layouts/partials/extrahead.html`

## Expected Edit Set
- `course-offline-v3` bundle entrypoint
- `course-offline-v3/layouts/partials/basejs.html`
- `course-offline-v3/layouts/partials/extrahead.html`
- Possibly targeted partial overrides in `course-offline-v3` for footer or CTA-related chrome

## Implementation Tasks
1. Replace v2 CSS/JS imports in the offline-v3 bundle with the minimal set of v3 CSS/JS imports needed for:
   - v3 styling
   - MIT Learn header behavior
   - mobile course menu behavior
   - course expander behavior
   - quiz initialization
   - image-gallery initialization
   - table-rowspan border logic
2. Keep the bundle offline-owned. Do not simply point offline-v3 at the online `course-v3` entrypoint, because offline-v3 must stay free to diverge.
3. Reuse shared v3 chrome where possible:
   - header
   - course banner
   - nav
   - course info panels
   - footer
4. Override only the chrome elements that are not offline-safe, especially footer links and any remaining online-only CTA wording.
5. Confirm that MathJax and any existing offline-specific asset injections still work after the bundle switch.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not solve page-type-specific rendering issues in this step.
- Do not rewrite unrelated v3 JS modules.
- Do not import MIT Learn network-dependent behavior that is unnecessary for offline-v3 if it causes breakage.

## Acceptance Routes
- `/`
- `/pages/assignments`
- `/pages/quiz-demo`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- Offline-v3 pages load v3 CSS rather than v2 CSS.
- Header, nav, mobile menu, and page expander behavior operate on offline-v3 routes.
- Footer and shared chrome do not emit obviously broken local links.
- Quiz and image-gallery initialization hooks still exist after the bundle conversion.

## Failure Modes / Stop Conditions
- Stop if the online `course-v3` bundle contains behavior that hard-depends on network services and cannot be selectively excluded. Keep the offline bundle curated rather than importing everything wholesale.
- Stop if the shared v3 footer cannot be made offline-safe via a targeted override; document the exact problem and isolate it in `course-offline-v3`.
