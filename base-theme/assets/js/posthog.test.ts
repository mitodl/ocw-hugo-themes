import { initPostHog } from "./posthog"
import posthog from "posthog-js"

jest.mock("posthog-js", () => ({
  init:               jest.fn(),
  register:           jest.fn(),
  reloadFeatureFlags: jest.fn()
}))

describe("initPostHog", () => {
  const originalEnv = { ...process.env }
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn

  beforeEach(() => {
    process.env = { ...originalEnv }
    console.log = jest.fn()
    console.warn = jest.fn()
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    console.log = originalConsoleLog
    console.warn = originalConsoleWarn
  })

  test("should initialize PostHog when enabled with valid API key", () => {
    Object.assign(process.env, {
      POSTHOG_ENABLED:         "true",
      POSTHOG_API_HOST:        "https://app.posthog.com",
      POSTHOG_PROJECT_API_KEY: "test-api-key", // pragma: allowlist secret
      POSTHOG_ENV:             "test"
    })

    const result = initPostHog()

    expect(posthog.init).toHaveBeenCalledWith(
      "test-api-key",
      expect.objectContaining({
        api_host:         "https://app.posthog.com",
        capture_pageview: true,
        autocapture:      true,
        persistence:      "localStorage+cookie",
        person_profiles:  "always",
        loaded:           expect.any(Function)
      })
    )

    const initArgs = (posthog.init as jest.Mock).mock.calls[0][1]
    initArgs.loaded()

    expect(posthog.register).toHaveBeenCalledWith({ environment: "test" })
    expect(console.log).toHaveBeenCalledWith("PostHog loaded successfully")
    expect(result).toBe(posthog)
  })

  test("should log warning when PostHog is enabled but API key is missing", () => {
    process.env.POSTHOG_ENABLED = "true"
    process.env.POSTHOG_API_HOST = "https://app.posthog.com"
    process.env.POSTHOG_PROJECT_API_KEY = ""

    initPostHog()

    expect(posthog.init).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith(
      "PostHog enabled but API key is missing"
    )
  })

  test("should log proper message when PostHog is disabled", () => {
    process.env.POSTHOG_ENABLED = "false"

    initPostHog()

    expect(posthog.init).not.toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith("PostHog disabled")
  })

  test("should not register environment when POSTHOG_ENV is not provided", () => {
    process.env.POSTHOG_ENABLED = "true"
    process.env.POSTHOG_API_HOST = "https://app.posthog.com"
    process.env.POSTHOG_PROJECT_API_KEY = "test-api-key" // pragma: allowlist secret

    initPostHog()

    expect(posthog.init).toHaveBeenCalled()
    expect(posthog.register).toHaveBeenCalledWith({ environment: undefined })
  })
})
