import React from "react"
import useMediaQuery from "@mui/material/useMediaQuery"
import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AskTim, { ASK_TIM_FEATURE_FLAG, type AskTimPostHog } from "./AskTim"

let mockDrawerModuleLoads = 0

jest.mock("@mitodl/smoot-design", () => {
  const ReactActual = jest.requireActual<typeof import("react")>("react")

  return {
    Button: ReactActual.forwardRef<
      HTMLButtonElement,
      React.PropsWithChildren<
        React.ButtonHTMLAttributes<HTMLButtonElement> & {
          edge?: string
          size?: string
          startIcon?: React.ReactNode
          variant?: string
        }
      >
    >(function MockButton(
      {
        children,
        edge: _edge,
        size: _size,
        startIcon,
        variant: _variant,
        ...props
      },
      ref
    ) {
      return (
        <button ref={ref} {...props}>
          {startIcon}
          {children}
        </button>
      )
    }),
    ThemeProvider: ({ children }: React.PropsWithChildren) => children
  }
})

jest.mock("@mui/material/useMediaQuery", () => ({
  __esModule: true,
  default:    jest.fn(() => false)
}))

jest.mock("./AskTimDrawer", () => {
  mockDrawerModuleLoads += 1
  return {
    __esModule: true,
    default:    ({ open }: { open: boolean }) =>
      open ? <div data-testid="ask-tim-drawer" /> : null
  }
})

type FeatureFlagsCallback = Parameters<AskTimPostHog["onFeatureFlags"]>[0]
const useMediaQueryMock = jest.mocked(useMediaQuery)

const makePostHog = () => {
  let callback: FeatureFlagsCallback | undefined
  const unsubscribe = jest.fn()
  const posthog = {
    capture:        jest.fn(),
    onFeatureFlags: jest.fn((nextCallback: FeatureFlagsCallback) => {
      callback = nextCallback
      return unsubscribe
    })
  } as unknown as AskTimPostHog

  const sendFlags = async (
    flags: string[],
    context?: { errorsLoading?: boolean }
  ) => {
    await act(async () => {
      callback?.(flags, {}, context)
    })
  }

  return { posthog, sendFlags, unsubscribe }
}

const renderAskTim = (
  posthog?: AskTimPostHog,
  syllabusEndpoint = "https://learn-ai.test/syllabus/",
  mobileContainer?: Element
) =>
  render(
    <AskTim
      courseTitle="Structure and Interpretation"
      mobileContainer={mobileContainer}
      posthog={posthog}
      readableId="6.001+fall_2024"
      syllabusEndpoint={syllabusEndpoint}
    />
  )

beforeEach(() => {
  useMediaQueryMock.mockReturnValue(false)
})

test("stays off by default and responds to asynchronous feature flags", async () => {
  const { posthog, sendFlags } = makePostHog()
  renderAskTim(posthog)

  expect(posthog.onFeatureFlags).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole("button", { name: /ask tim/i })).toBeNull()

  await sendFlags([])
  expect(screen.queryByRole("button", { name: /ask tim/i })).toBeNull()

  await sendFlags([ASK_TIM_FEATURE_FLAG])
  const trigger = screen.getByRole("button", {
    name: "AskTIM about this course"
  })
  expect(trigger).toBeInTheDocument()
  expect(trigger).toHaveClass("ask-tim-trigger", "w-100")
  expect(trigger).toHaveTextContent("AskTIM about this course")
  const tim = screen.getByText("TIM")
  expect(tim.tagName).toBe("STRONG")
  expect(tim.parentElement).toHaveClass("ask-tim-label")
  expect(tim.parentElement).toHaveTextContent("AskTIM about this course")
  expect(tim.parentElement?.parentElement).toHaveClass("ask-tim-content")
})

test("moves the trigger into the mobile layout without duplicating it", async () => {
  const mobileContainer = document.createElement("div")
  document.body.appendChild(mobileContainer)
  useMediaQueryMock.mockReturnValue(true)
  const { posthog, sendFlags } = makePostHog()
  const { container } = renderAskTim(
    posthog,
    "https://learn-ai.test/syllabus/",
    mobileContainer
  )

  await sendFlags([ASK_TIM_FEATURE_FLAG])

  expect(
    within(mobileContainer).getByRole("button", {
      name: "AskTIM about this course"
    })
  ).toBeInTheDocument()
  expect(container.querySelector("button")).toBeNull()

  mobileContainer.remove()
})

test("fails closed when PostHog reports a feature flag loading error", async () => {
  const { posthog, sendFlags } = makePostHog()
  renderAskTim(posthog)

  await sendFlags([ASK_TIM_FEATURE_FLAG], { errorsLoading: true })

  expect(screen.queryByRole("button", { name: /ask tim/i })).toBeNull()
})

test("does not subscribe or render without a syllabus endpoint", () => {
  const { posthog } = makePostHog()
  renderAskTim(posthog, "")

  expect(posthog.onFeatureFlags).not.toHaveBeenCalled()
  expect(screen.queryByRole("button", { name: /ask tim/i })).toBeNull()
})

test("does not render without PostHog", () => {
  renderAskTim(undefined)

  expect(screen.queryByRole("button", { name: /ask tim/i })).toBeNull()
})

test("unsubscribes from feature flag updates on unmount", () => {
  const { posthog, unsubscribe } = makePostHog()
  const { unmount } = renderAskTim(posthog)

  unmount()

  expect(unsubscribe).toHaveBeenCalledTimes(1)
})

test("loads the drawer on first click and captures exact analytics", async () => {
  const user = userEvent.setup()
  const { posthog, sendFlags } = makePostHog()
  renderAskTim(posthog)
  await sendFlags([ASK_TIM_FEATURE_FLAG])

  expect(mockDrawerModuleLoads).toBe(0)
  expect(screen.queryByTestId("ask-tim-drawer")).toBeNull()

  await user.click(
    screen.getByRole("button", { name: "AskTIM about this course" })
  )

  expect(await screen.findByTestId("ask-tim-drawer")).toBeInTheDocument()
  expect(mockDrawerModuleLoads).toBe(1)
  expect(posthog.capture).toHaveBeenCalledTimes(1)
  expect(posthog.capture).toHaveBeenCalledWith("asktim_clicked", {
    type:         "syllabus_bot",
    readableId:   "6.001+fall_2024",
    resourceType: "course",
    platformCode: "ocw"
  })
})

test("does not reopen the drawer when a revoked flag is restored", async () => {
  const user = userEvent.setup()
  const { posthog, sendFlags } = makePostHog()
  renderAskTim(posthog)
  await sendFlags([ASK_TIM_FEATURE_FLAG])

  await user.click(
    screen.getByRole("button", { name: "AskTIM about this course" })
  )
  expect(await screen.findByTestId("ask-tim-drawer")).toBeInTheDocument()

  await sendFlags([])
  await sendFlags([ASK_TIM_FEATURE_FLAG])

  expect(screen.queryByTestId("ask-tim-drawer")).toBeNull()
  expect(posthog.capture).toHaveBeenCalledTimes(1)
})
