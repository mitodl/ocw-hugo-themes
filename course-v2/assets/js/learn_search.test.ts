import type { PostHog } from "posthog-js"
import {
  LEARN_SEARCH_FLAG,
  LEARN_SEARCH_PENDING_ATTRIBUTE,
  LEARN_SEARCH_STORAGE_KEY,
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
    localStorage.clear()
    jest.restoreAllMocks()
  })

  test("applyLearnSearch(true) shows the Learn copy and remembers it", () => {
    applyLearnSearch(true)

    expect(learnShown()).toBe(true)
    expect(localStorage.getItem(LEARN_SEARCH_STORAGE_KEY)).toBe("true")
  })

  test("applyLearnSearch(false) restores the OCW copy and forgets it", () => {
    applyLearnSearch(true)
    applyLearnSearch(false)

    expect(learnShown()).toBe(false)
    expect(localStorage.getItem(LEARN_SEARCH_STORAGE_KEY)).toBeNull()
  })

  test("applyLearnSearch still switches copies when storage is blocked", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked")
    })

    expect(() => applyLearnSearch(true)).not.toThrow()
    expect(learnShown()).toBe(true)
  })

  test("initLearnSearch follows the flag each time flags load", () => {
    const { posthog, sendFlags } = makePostHog()
    initLearnSearch(posthog)

    sendFlags([LEARN_SEARCH_FLAG])
    expect(learnShown()).toBe(true)

    sendFlags(["some-other-flag"])
    expect(learnShown()).toBe(false)
    expect(localStorage.getItem(LEARN_SEARCH_STORAGE_KEY)).toBeNull()
  })

  test("initLearnSearch keeps the last known value when flags fail to load", () => {
    applyLearnSearch(true)
    const { posthog, sendFlags } = makePostHog()
    initLearnSearch(posthog)

    sendFlags([], { errorsLoading: true })

    expect(learnShown()).toBe(true)
    expect(localStorage.getItem(LEARN_SEARCH_STORAGE_KEY)).toBe("true")
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
