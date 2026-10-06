import type { PostHog } from "posthog-js"

/**
 * Course v2 renders an OCW copy and an MIT Learn copy of its search links
 * (layouts/partials/search_variant_copies.html); CSS shows the Learn copy when
 * <html data-search="learn"> is set. This flag decides which copy a visitor
 * gets.
 */
export const LEARN_SEARCH_FLAG = "ocw-course-v2-learn-search"
// Also read before first paint by the inline script in
// course-v2/layouts/partials/extrahead.html; keep the two in sync.
export const LEARN_SEARCH_STORAGE_KEY = "learnSearchEnabled"
// Set by that same inline script, which hides the Topics while it's present
// and removes it itself after a short timeout in case PostHog never answers.
export const LEARN_SEARCH_PENDING_ATTRIBUTE = "data-search-pending"

export function applyLearnSearch(enabled: boolean): void {
  const root = document.documentElement
  if (enabled) {
    root.setAttribute("data-search", "learn")
  } else {
    root.removeAttribute("data-search")
  }
  try {
    if (enabled) {
      localStorage.setItem(LEARN_SEARCH_STORAGE_KEY, "true")
    } else {
      localStorage.removeItem(LEARN_SEARCH_STORAGE_KEY)
    }
  } catch {
    // Storage can be blocked; the attribute still applies to this page view.
  }
}

export function initLearnSearch(
  posthog: Pick<PostHog, "onFeatureFlags">
): void {
  posthog.onFeatureFlags((flags, _variants, context) => {
    // Keep the last known value when flags fail to load (e.g. blocked).
    if (!context?.errorsLoading) {
      applyLearnSearch(flags.includes(LEARN_SEARCH_FLAG))
    }
    // PostHog has answered either way, so show the Topics.
    document.documentElement.removeAttribute(LEARN_SEARCH_PENDING_ATTRIBUTE)
  })
}
