import type { PostHog } from "posthog-js"

/**
 * Course v2 renders an OCW copy and an MIT Learn copy of its search links
 * (layouts/partials/search_variant_copies.html); CSS shows the Learn copy when
 * <html data-search="learn"> is set. This flag decides which copy a visitor
 * gets.
 */
export const LEARN_SEARCH_FLAG = "ocw-course-v2-learn-search"
// Set before first paint by the inline script in
// course-v2/layouts/partials/extrahead.html, which hides the Topics while it's
// present and removes it itself after a short timeout in case PostHog never
// answers. Flag answers only apply while it's present.
export const LEARN_SEARCH_PENDING_ATTRIBUTE = "data-search-pending"

export function applyLearnSearch(enabled: boolean): void {
  const root = document.documentElement
  if (enabled) {
    root.setAttribute("data-search", "learn")
  } else {
    root.removeAttribute("data-search")
  }
}

export function initLearnSearch(
  posthog: Pick<PostHog, "onFeatureFlags">
): void {
  posthog.onFeatureFlags((flags, _variants, context) => {
    const root = document.documentElement
    // Each page view picks its copy once. Once the Topics show, whether after
    // an earlier answer or the fallback timeout, a late answer would swap them
    // in view.
    if (!root.hasAttribute(LEARN_SEARCH_PENDING_ATTRIBUTE)) return
    // Keep the OCW copy when flags fail to load (e.g. blocked).
    if (!context?.errorsLoading) {
      applyLearnSearch(flags.includes(LEARN_SEARCH_FLAG))
    }
    root.removeAttribute(LEARN_SEARCH_PENDING_ATTRIBUTE)
  })
}
