# Step 03: Shared Offline URL And Routing

> **Status: ✅ COMPLETE**

## Objective
- Completion rule: this step is not complete until every validation point in the Validation Points section has been implemented and verified.

- Normalize offline-safe page, resource, asset, and internal-link routing through shared helpers before page-specific behavior is refined.

## Assumes Complete
- Steps 01 and 02 are complete.
- Inherited invariants:
  - `course-offline-v3` exists and builds in local E2E.
  - The offline-v3 theme is still thin.
  - No schema or content-model changes are allowed.

## Current Repo Truth (post-implementation)
- `base-offline` shared helpers are unchanged and work for both v2 and v3 offline themes.
- `course-offline-v3` owns v3-specific overrides:
  - `nav.html`, `nav_item.html`, `nav_url.html` — thread v3-specific context through `path_to_root.html`.
  - `course_home_page_url.html`, `get_destination.html`, `get_canonical_url.html` — ported from `course-offline` as v3-compatible copies.
- v3's `resource_list_item.html` calls `page_url.html` inline for offline-safe card-title URLs; no separate title-partial override needed.
- Remaining known routing hotspots:
  - `see_all.html` — resolved; accepts `.permalink` via dict and is rewritten by `page_url.html` offline.
  - `footer-v3.html` — resolved; routes links through `home_url.html` and `site_root_url.html`.

## Implementation Notes
- Deviated from expected edit set: added `nav.html` and `nav_item.html` overrides (plan expected only `nav_url.html`). This was needed because the v3 nav partial threads different context (`dict` with `menuItem`, `device`) than v2.
- The `see_all.html` raw `.permalink` issue was deferred rather than solved here. It impacts video galleries and resource lists (steps 07, 10).
- `resource_link.html` shortcode routing appears to work through the theme chain without a `course-offline-v3` override, verified by the routing E2E spec.

## Read Only These Files
- `base-offline/layouts/partials/page_url.html`
- `base-offline/layouts/partials/resource_url.html`
- `base-offline/layouts/partials/site_root_url.html`
- `base-offline/layouts/partials/webpack_url.html`
- `base-offline/layouts/partials/get_resource_download_link.html`
- `course-offline/layouts/partials/nav_url.html`
- `course-offline/layouts/partials/course_home_page_url.html`
- `course-offline/layouts/partials/get_destination.html`
- `course-offline/layouts/partials/get_canonical_url.html`
- `course-v3/layouts/partials/resource_list_item.html`
- `course-v3/layouts/partials/see_all.html`
- `base-theme/layouts/shortcodes/resource_link.html`
- `base-theme/layouts/partials/video_embed.html`

## Expected Edit Set
- `base-offline` helper partials where routing should be shared
- `course-offline-v3` copies of course-specific offline helpers
- `course-v3/layouts/partials/resource_list_item.html` or `course-offline-v3` override of that partial
- `course-v3/layouts/partials/see_all.html` or `course-offline-v3` override
- `base-theme/layouts/shortcodes/resource_link.html` or an offline-safe override path if shared change is too risky

## Implementation Tasks
1. Port the course-specific offline helpers from `course-offline` into `course-offline-v3` if the copied bootstrap step has not already preserved them.
2. Route page URLs through helper partials rather than raw `.permalink` / `.Permalink` wherever v3 list cards or shortcode links currently bypass offline-safe behavior.
3. Confirm that embedded “View video page” links in `video_embed.html` already use `page_url.html`; if so, keep that path unchanged.
4. Rework non-video download link generation so the final rendered path is package-safe. Root-absolute `/static_resources/...` is not acceptable as the end state.
5. Keep shared fixes in `base-offline` if they clearly benefit both offline themes. Only use `course-offline-v3` overrides when the behavior is truly v3-specific.
6. Verify that markdown destination rewriting, course-home URLs, nav URLs, and canonical URL generation still behave correctly in offline-v3.
- After the step passes its validation points and regression gate, create a commit containing all changes for this step and only those changes.

## Invariants / Do Not Change
- Do not change v3 bundle imports in this step.
- Do not start home-page or page-family layout work yet.
- Do not fork large v3 templates if a partial-level override or shared helper fix is sufficient.

## Acceptance Routes
- `/pages/subscripts-and-superscripts`
- `/pages/shortcode-demos`
- `/pages/video-series-overview`
- `/lists/a-resource-list`
- `/download`

## Validation Points
- Step-specific validation below must pass before the step can close.
- Regression gate: build the existing `course-v2` offline site and confirm it still builds successfully after this step.
- Regression gate: run the affected existing E2E coverage for `course-v2` online, `course-v2` offline, and `course-v3` online themes, plus any shared-theme coverage touched by the change.
- Regression gate: if this step changes shared helpers, shared partials, webpack entries, env wiring, or E2E harness code, broaden the regression check to every impacted theme before marking the step complete.

- Internal page links resolve locally instead of relying on raw `.Permalink`.
- Resource-card titles and “See all” links resolve locally.
- Shortcode-generated resource links resolve locally.
- Embedded “View video page” links resolve locally.
- Download links for non-video resources no longer rely on root-absolute `/static_resources/...` in the final rendered path.

## Failure Modes / Stop Conditions
- Stop if a shared `base-offline` change would break the existing v2 offline theme; in that case, isolate the behavior in `course-offline-v3`.
- Stop if package-safe non-video file URLs cannot be achieved with the current helper model; document the constraint before touching page-specific templates.
