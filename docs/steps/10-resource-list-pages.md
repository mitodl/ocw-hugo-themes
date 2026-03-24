# Step 10: Resource-List Pages

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Make list-style resource browsing fully portable offline while preserving the v3 card structure and styling.

## Assumes Complete
- Steps 01 through 09 are complete.
- Inherited invariants:
  - Shared routing and shortcode behavior are already offline-safe.
  - `course-offline-v3` remains thin and no schema changes are allowed.

## Current Repo Truth
- `course-v3/layouts/partials/resource_list_item.html` is a known hotspot because the title link uses raw `.permalink`.
- The same card partial is reused across `/lists/a-resource-list` and learning-resource-type term surfaces.
- `course-v3/layouts/partials/see_all.html` is a known hotspot because it also uses raw `.permalink`.
- `get_resource_download_link.html` is the shared entry point for file download URLs.

## Read Only These Files
- `course-v3/layouts/lists/single.html`
- `course-v3/layouts/learning_resource_types/term.html`
- `course-v3/layouts/partials/resource_list.html`
- `course-v3/layouts/partials/resource_list_item.html`
- `course-v3/layouts/partials/resource_list_collapsible.html`
- `course-v3/layouts/partials/see_all.html`
- `base-offline/layouts/partials/get_resource_download_link.html`

## Expected Edit Set
- `course-offline-v3/layouts/partials/resource_list_item.html` or a shared helper change if that is cleaner
- `course-offline-v3/layouts/partials/see_all.html` or a shared helper change if that is cleaner
- Possibly `base-offline/layouts/partials/get_resource_download_link.html`

## Implementation Tasks
1. Fix resource-card title routing so titles open local resource pages, not raw online permalinks.
2. Fix “See all” routing so list-expansion navigation remains local.
3. Preserve the existing v3 resource-card markup and classes so current styling and tests remain compatible.
4. Ensure download links resolve to local files through the offline-safe helper path.
5. Validate both standalone resource-list pages and taxonomy-driven list surfaces because they share the same partials.

## Invariants / Do Not Change
- Do not redesign or restyle the v3 resource cards.
- Do not fork full list layouts if partial-level overrides are sufficient.
- Keep shared fixes in `base-offline` if they benefit both offline themes.

## Acceptance Routes
- `/lists/a-resource-list`
- `/download` term-group list surfaces as a partial validation point

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- Resource-card titles navigate to local resource pages.
- Download icons and download links point to local file destinations.
- “See all” links remain local.
- Card structure and visible styling remain v3-consistent.

## Failure Modes / Stop Conditions
- Stop if fixing list cards requires broad layout overrides across multiple v3 templates. Re-check whether helper-based URL generation can solve it first.
- Stop if download link behavior is still blocked by unresolved helper portability issues from step 03.
