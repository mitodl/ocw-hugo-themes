# Step 12: Non-Video Resource Pages

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Make file, PDF, and image resource detail pages work cleanly offline using the shared v3 resource-page structure.

## Assumes Complete
- Steps 01 through 11 are complete.
- Inherited invariants:
  - Routing and download helpers are already offline-safe.
  - Resource-list and `/download` behavior are already local.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- `course-v3/layouts/resources/single.html` renders through `resource_title_v3.html` and `resource_body_v3.html`.
- `resource_body_v3.html` delegates non-video rendering to shared base partials such as `image_page.html` and `pdf_viewer.html`.
- Non-video resources cover PDFs, images, and generic file pages with badges, metadata, and download actions.

## Read Only These Files
- `course-v3/layouts/resources/single.html`
- `base-theme/layouts/partials/resource_title_v3.html`
- `base-theme/layouts/partials/resource_body_v3.html`
- `base-theme/layouts/partials/image_page.html`
- `base-theme/layouts/partials/pdf_viewer.html`
- `base-theme/layouts/partials/get_resource_download_link.html`
- `base-offline/layouts/partials/get_resource_download_link.html`

## Expected Edit Set
- Prefer shared helper fixes in `base-offline`
- `course-offline-v3/layouts/resources/single.html` only if a full resource-page override becomes necessary
- `course-offline-v3` partial overrides for specific non-video resource subcomponents if needed

## Implementation Tasks
1. Keep the v3 resource-page structure as the baseline.
2. Validate non-video resource behavior for:
   - page title and badge
   - file metadata
   - download button
   - PDF viewer
   - image-page display
3. Fix only the offline deltas:
   - local file/view URLs
   - any root-relative URLs still emitted by shared partials
   - any v3-specific CTA wording that is wrong in offline context
4. Verify representative file types rather than relying on a single PDF page.

## Invariants / Do Not Change
- Do not fork the full v3 resource-page structure unless partial-level overrides cannot solve the problem.
- Do not collapse resource pages into direct file downloads; keep the v3 detail-page experience.
- Keep shared fixes in `base-offline` whenever that is safe.

## Acceptance Routes
- `/resources/file_pdf`
- `/resources/example_pdf`
- `/resources/example_jpg`
- `/resources/example_notes`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- Non-video resource pages render with v3 page structure intact.
- PDF pages preview locally and download locally.
- Image resource pages render locally and download locally.
- Generic file resource pages offer correct local download behavior.

## Failure Modes / Stop Conditions
- Stop if `resource_body_v3.html` emits online-only URLs that cannot be corrected with helper overrides.
- Stop if non-video file URLs still depend on root-absolute `/static_resources/...` behavior after step 03.
