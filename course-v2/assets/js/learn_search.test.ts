import type { PostHog } from "posthog-js"
import {
  LEARN_SEARCH_FLAG,
  LEARN_SEARCH_PENDING_ATTRIBUTE,
  applyLearnSearch,
  initLearnSearch
} from "./learn_search"

type FeatureFlagsCallback = Parameters<PostHog["onFeatureFlags"]>[0]

const makePostHog = () => {
  let callback: FeatureFlagsCallback | undefined
  const posthog = {
    onFeatureFlags: jest.fn((nextCallback: FeatureFlagsCallback) => {
      callback = nextCallback
      return () => undefined
    })
  }
  const sendFlags = (flags: string[], context?: { errorsLoading?: boolean }) =>
    callback?.(flags, {}, context)
  return { posthog, sendFlags }
}

const learnShown = () =>
  document.documentElement.getAttribute("data-search") === "learn"

describe("learn_search", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-search")
    document.documentElement.removeAttribute(LEARN_SEARCH_PENDING_ATTRIBUTE)
  })

  test("applyLearnSearch switches between the Learn and OCW copies", () => {
    applyLearnSearch(true)
    expect(learnShown()).toBe(true)

    applyLearnSearch(false)
    expect(learnShown()).toBe(false)
  })

  test("initLearnSearch follows the flag each time flags load", () => {
    const { posthog, sendFlags } = makePostHog()
    initLearnSearch(posthog)

    sendFlags([LEARN_SEARCH_FLAG])
    expect(learnShown()).toBe(true)

    sendFlags(["some-other-flag"])
    expect(learnShown()).toBe(false)
  })

  test("initLearnSearch keeps the current copy when flags fail to load", () => {
    const { posthog, sendFlags } = makePostHog()
    initLearnSearch(posthog)
    sendFlags([LEARN_SEARCH_FLAG])

    sendFlags([], { errorsLoading: true })

    expect(learnShown()).toBe(true)
  })

  test.each([
    { name: "with the flag on", flags: [LEARN_SEARCH_FLAG], context: {} },
    { name: "with the flag off", flags: [], context: {} },
    {
      name:    "when flags fail to load",
      flags:   [],
      context: { errorsLoading: true }
    }
  ])(
    "initLearnSearch reveals the Topics once PostHog answers, $name",
    ({ flags, context }) => {
      // The inline script in extrahead.html sets this before first paint.
      document.documentElement.setAttribute(LEARN_SEARCH_PENDING_ATTRIBUTE, "")
      const { posthog, sendFlags } = makePostHog()
      initLearnSearch(posthog)
      expect(
        document.documentElement.hasAttribute(LEARN_SEARCH_PENDING_ATTRIBUTE)
      ).toBe(true)

      sendFlags(flags, context)

      expect(
        document.documentElement.hasAttribute(LEARN_SEARCH_PENDING_ATTRIBUTE)
      ).toBe(false)
    }
  )
})
