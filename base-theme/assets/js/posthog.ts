import posthog from "posthog-js"

export function initPostHog(): typeof posthog {
  const posthogEnv = process.env.POSTHOG_ENV
  const posthogEnabled = process.env.POSTHOG_ENABLED === "true"
  const posthogApiHost = process.env.POSTHOG_API_HOST
  const posthogApiKey = process.env.POSTHOG_PROJECT_API_KEY

  if (posthogEnabled && posthogApiKey) {
    posthog.init(posthogApiKey, {
      api_host:         posthogApiHost,
      capture_pageview: true,
      autocapture:      true,
      persistence:      "localStorage+cookie",
      person_profiles:  "always",
      loaded:           function() {
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
