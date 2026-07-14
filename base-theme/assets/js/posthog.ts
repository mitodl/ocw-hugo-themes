import posthog from "posthog-js"

declare global {
  interface Window {
    posthog?: typeof posthog
  }
}

export interface InitPostHogOptions {
  apiKey: string | undefined
  enabled: boolean
}

export function initPostHog(options: InitPostHogOptions): typeof posthog {
  const posthogEnv = process.env.POSTHOG_ENV
  const posthogEnabled = options.enabled
  const posthogApiHost = process.env.POSTHOG_API_HOST
  const posthogUiHost = process.env.POSTHOG_UI_HOST || process.env.POSTHOG_API_HOST
  const posthogApiKey = options.apiKey

  if (posthogEnabled && posthogApiKey) {
    posthog.init(posthogApiKey, {
      api_host:                     posthogApiHost,
      ui_host:                      posthogUiHost,
      capture_pageview:             true,
      autocapture:                  true,
      opt_out_capturing_by_default: false,
      persistence:                  "localStorage+cookie",
      person_profiles:              "always",
      loaded:                       function() {
        posthog.reloadFeatureFlags()
        console.log("PostHog loaded successfully")
      }
    })
    posthog.register({ environment: posthogEnv })
  } else if (posthogEnabled) {
    console.warn("PostHog enabled but API key is missing")
  } else {
    console.log("PostHog disabled")
  }

  return posthog
}

export function isFeatureEnabled(
  flagKey: string,
  defaultValue = false
): boolean {
  if (window.posthog && typeof window.posthog.isFeatureEnabled === "function") {
    return window.posthog.isFeatureEnabled(flagKey) ?? defaultValue
  }
  return defaultValue
}
