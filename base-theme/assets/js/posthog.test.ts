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
      POSTHOG_API_HOST:        "https://app.posthog.com",
      POSTHOG_UI_HOST:         "https://us.posthog.com",
      POSTHOG_ENV:             "test",
      POSTHOG_PROJECT_API_KEY: "test-api-key", // pragma: allowlist secret
      POSTHOG_ENABLED:         "true"
    })

    const result = initPostHog()

    expect(posthog.init).toHaveBeenCalledWith(
      "test-api-key",
      expect.objectContaining({
        api_host:         "https://app.posthog.com",
        ui_host:          "https://us.posthog.com",
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
    process.env.POSTHOG_API_HOST = "https://app.posthog.com"
    process.env.POSTHOG_PROJECT_API_KEY = ""
    process.env.POSTHOG_ENABLED = "true"

    initPostHog()

    expect(posthog.init).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith(
      "PostHog enabled but API key is missing"
    )
  })

  test("should log warning when PostHog is enabled but API key is undefined", () => {
    process.env.POSTHOG_API_HOST = "https://app.posthog.com"
    delete process.env.POSTHOG_PROJECT_API_KEY
    process.env.POSTHOG_ENABLED = "true"

    initPostHog()

    expect(posthog.init).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalledWith(
      "PostHog enabled but API key is missing"
    )
  })

  test("should log proper message when PostHog is disabled", () => {
    process.env.POSTHOG_PROJECT_API_KEY = "test-api-key" // pragma: allowlist secret
    process.env.POSTHOG_ENABLED = "false"
    initPostHog()

    expect(posthog.init).not.toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith("PostHog disabled")
  })

  test("should fall back to the API host when POSTHOG_UI_HOST is empty", () => {
    process.env.POSTHOG_API_HOST = "https://app.posthog.com"
    process.env.POSTHOG_UI_HOST = ""
    process.env.POSTHOG_PROJECT_API_KEY = "test-api-key" // pragma: allowlist secret
    process.env.POSTHOG_ENABLED = "true"

    initPostHog()

    expect(posthog.init).toHaveBeenCalledWith(
      "test-api-key",
      expect.objectContaining({ ui_host: "https://app.posthog.com" })
    )
  })

  test("should not register environment when POSTHOG_ENV is not provided", () => {
    process.env.POSTHOG_API_HOST = "https://app.posthog.com"
    process.env.POSTHOG_PROJECT_API_KEY = "test-api-key" // pragma: allowlist secret
    process.env.POSTHOG_ENABLED = "true"

    initPostHog()

    expect(posthog.init).toHaveBeenCalled()
    expect(posthog.register).toHaveBeenCalledWith({ environment: undefined })
  })
})
