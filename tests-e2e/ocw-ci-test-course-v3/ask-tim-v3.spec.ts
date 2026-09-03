import { expect, Page, test } from "@playwright/test"
import { env } from "../../env"
import { CoursePage, offlineFileUrl } from "../util"

const FEATURE_FLAG = "ocw-course-v3-ask-tim"
const ASK_TIM_ENDPOINT = env.LEARN_AI_SYLLABUS_ENDPOINT
const ASK_TIM_TRIGGER_NAME = "AskTIM about this course"
const COURSE_READABLE_ID = "123+fall_2022"
const COURSE_TITLE = "OCW CI Test Course"
const CONVERSATION_STARTERS = [
  "What is this course about?",
  "What are the prerequisites for this course?",
  "How will this course be graded?"
]

type CapturedEvent = {
  event: string
  properties?: Record<string, unknown>
}

type RecordedFetch = {
  body: string | null
  contentType: string | null
  credentials?: RequestCredentials
  csrfToken: string | null
  method?: string
  url: string
}

type InstrumentedWindow = Window & {
  __askTimCaptures: CapturedEvent[]
  __askTimFetches: RecordedFetch[]
  __askTimFlagsSettled: boolean
}

type FeatureFlagCallback = (
  flags: string[],
  variants: Record<string, string | boolean>,
  context: { errorsLoading: boolean }
) => void

type InterceptedPostHog = {
  capture: (event: string, properties?: Record<string, unknown>) => void
  onFeatureFlags: (callback: FeatureFlagCallback) => () => void
}

const installFeatureFlag = async (
  page: Page,
  enabled: boolean,
  mockResponse?: { body: string; status: number }
) => {
  await page.addInitScript(
    ({ enabled, featureFlag, mockResponse, syllabusEndpoint }) => {
      const testWindow = window as InstrumentedWindow
      const nativeFetch = window.fetch.bind(window)
      let posthog: InterceptedPostHog | undefined

      testWindow.__askTimCaptures = []
      testWindow.__askTimFetches = []
      testWindow.__askTimFlagsSettled = false

      window.fetch = (input, init) => {
        const request = input instanceof Request ? input : undefined
        const url =
          typeof input === "string" ?
            input :
            input instanceof URL ?
              input.href :
              input.url

        if (url === syllabusEndpoint) {
          const headers = new Headers(init?.headers ?? request?.headers)
          testWindow.__askTimFetches.push({
            body:        typeof init?.body === "string" ? init.body : null,
            contentType: headers.get("content-type"),
            credentials: init?.credentials ?? request?.credentials,
            csrfToken:   headers.get("x-csrftoken"),
            method:      init?.method ?? request?.method,
            url
          })

          if (mockResponse) {
            return Promise.resolve(
              new Response(mockResponse.body, {
                headers: { "content-type": "text/plain; charset=utf-8" },
                status:  mockResponse.status
              })
            )
          }
        }

        return nativeFetch(input, init)
      }

      Object.defineProperty(window, "posthog", {
        configurable: true,
        get:          () => posthog,
        set:          (value: InterceptedPostHog) => {
          posthog = value
          value.capture = (event, properties) => {
            testWindow.__askTimCaptures.push({ event, properties })
          }
          value.onFeatureFlags = callback => {
            let subscribed = true
            window.setTimeout(() => {
              if (!subscribed) return
              callback(
                enabled ? [featureFlag] : [],
                {},
                {
                  errorsLoading: false
                }
              )
              window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                  testWindow.__askTimFlagsSettled = true
                })
              })
            }, 0)
            return () => {
              subscribed = false
            }
          }
        }
      })
    },
    {
      enabled,
      featureFlag:      FEATURE_FLAG,
      mockResponse,
      syllabusEndpoint: ASK_TIM_ENDPOINT
    }
  )
}

const waitForFeatureFlag = async (page: Page) => {
  await page.waitForFunction(
    () => (window as InstrumentedWindow).__askTimFlagsSettled
  )
}

const openAskTim = async (page: Page) => {
  const trigger = page.getByRole("button", {
    name: ASK_TIM_TRIGGER_NAME
  })
  await expect(trigger).toBeVisible()
  await trigger.click()

  const drawer = page.getByRole("dialog", { name: "Ask TIM", exact: true })
  await expect(drawer).toBeVisible()
  return { drawer, trigger }
}

test("disabled flag renders no trigger and never requests the lazy drawer", async ({
  page
}) => {
  const drawerChunkRequests: string[] = []
  page.on("request", request => {
    if (/AskTimDrawer.*\.js/i.test(new URL(request.url()).pathname)) {
      drawerChunkRequests.push(request.url())
    }
  })
  await installFeatureFlag(page, false)

  const course = new CoursePage(page, "course-v3")
  await course.goto("/")
  await waitForFeatureFlag(page)

  await expect(
    page.getByRole("button", { name: ASK_TIM_TRIGGER_NAME })
  ).toHaveCount(0)
  expect(drawerChunkRequests).toEqual([])
})

test("enabled flag shows AskTIM only on the homepage", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 })
  await installFeatureFlag(page, true)
  const course = new CoursePage(page, "course-v3")

  await course.goto("/")
  await waitForFeatureFlag(page)
  const trigger = page.getByRole("button", { name: ASK_TIM_TRIGGER_NAME })
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveText(ASK_TIM_TRIGGER_NAME)
  await expect(trigger.locator(".ask-tim-label")).toHaveCSS(
    "white-space",
    "nowrap"
  )
  expect((await trigger.boundingBox())?.width).toBe(254)
  await expect(trigger).toHaveCSS("height", "52px")
  await expect(trigger).toHaveCSS("border-radius", "4px")
  await expect(trigger).toHaveCSS("border", "1px solid rgb(221, 225, 230)")
  await expect(trigger).toHaveCSS("background-color", "rgb(255, 255, 255)")
  await expect(trigger).toHaveCSS(
    "box-shadow",
    "rgba(19, 20, 21, 0.08) 0px 4px 8px 0px"
  )
  const content = trigger.locator(".ask-tim-content")
  await expect(content).toHaveCSS("gap", "8px")
  await expect(trigger.locator("svg")).toHaveCSS("width", "20px")
  await expect(trigger.locator("svg")).toHaveCSS("height", "20px")
  await expect(trigger.locator(".ask-tim-label")).toHaveCSS(
    "line-height",
    "18px"
  )
  const triggerBox = await trigger.boundingBox()
  const contentBox = await content.boundingBox()
  expect(triggerBox).not.toBeNull()
  expect(contentBox).not.toBeNull()
  expect(contentBox!.y - triggerBox!.y).toBe(16)
  expect(
    triggerBox!.y + triggerBox!.height - contentBox!.y - contentBox!.height
  ).toBe(16)
  await expect(
    page.locator(".course-banner-v3 #ask-tim-container")
  ).toHaveCount(0)
  await expect(page.locator("#ask-tim-container")).toContainText(
    ASK_TIM_TRIGGER_NAME
  )

  await page.setViewportSize({ width: 1676, height: 900 })
  expect((await trigger.boundingBox())?.width).toBe(304)

  await page.setViewportSize({ width: 767, height: 800 })
  await expect(page.locator("#ask-tim-container")).toBeEmpty()
  await expect(page.locator("#ask-tim-mobile-container")).toContainText(
    ASK_TIM_TRIGGER_NAME
  )
  await expect(
    page.locator(".course-image-section .download-course-section")
  ).toBeHidden()
  await expect(
    page.locator(".bottom-download-button .download-course-section")
  ).toBeVisible()

  await page.setViewportSize({ width: 768, height: 800 })
  await expect(page.locator("#ask-tim-mobile-container")).toBeEmpty()
  await expect(page.locator("#ask-tim-container")).toContainText(
    ASK_TIM_TRIGGER_NAME
  )
  await expect(
    page.locator(".course-image-section .download-course-section")
  ).toBeVisible()
  await expect(
    page.locator(".bottom-download-button .download-course-section")
  ).toBeHidden()
  expect((await trigger.boundingBox())?.width).toBe(254)
  await expect(trigger.locator(".ask-tim-label")).toHaveCSS(
    "white-space",
    "nowrap"
  )
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    )
  ).toBe(false)

  await course.goto("/pages/assignments")
  await expect(page.locator("#ask-tim-container")).toHaveCount(0)
  await expect(page.locator("#ask-tim-mobile-container")).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: ASK_TIM_TRIGGER_NAME })
  ).toHaveCount(0)
})

test("Ask TIM is absent from course-v2 and course-offline-v3", async ({
  page
}) => {
  await installFeatureFlag(page, true)

  const v2Course = new CoursePage(page, "course")
  await v2Course.goto("/")
  await expect(page.locator("#ask-tim-container")).toHaveCount(0)
  await expect(page.locator("#ask-tim-mobile-container")).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: ASK_TIM_TRIGGER_NAME })
  ).toHaveCount(0)

  await page.goto(offlineFileUrl("/"))
  await expect(page.locator("#ask-tim-container")).toHaveCount(0)
  await expect(page.locator("#ask-tim-mobile-container")).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: ASK_TIM_TRIGGER_NAME })
  ).toHaveCount(0)
})

test("click analytics, entry copy, and raw streaming request match the contract", async ({
  page
}) => {
  const answer = "This is the mocked raw-stream answer."
  await installFeatureFlag(page, true, {
    body:   `${answer}<!-- {"thread_id":"thread-1","checkpoint_pk":"checkpoint-1","error":"preserve"} -->`,
    status: 200
  })

  const course = new CoursePage(page, "course-v3")
  await course.goto("/")
  await waitForFeatureFlag(page)
  const { drawer } = await openAskTim(page)

  const captures = await page.evaluate(
    () => (window as InstrumentedWindow).__askTimCaptures
  )
  expect(
    captures.filter(capture => capture.event === "asktim_clicked")
  ).toEqual([
    {
      event:      "asktim_clicked",
      properties: {
        platformCode: "ocw",
        readableId:   COURSE_READABLE_ID,
        resourceType: "course",
        type:         "syllabus_bot"
      }
    }
  ])

  const entry = drawer.getByTestId("ai-chat-entry-screen")
  await expect(
    entry.getByText("What do you want to know about this course?", {
      exact: true
    })
  ).toBeVisible()
  const starterLabels = await entry
    .locator("button")
    .evaluateAll(buttons =>
      buttons.map(button => button.textContent?.trim()).filter(Boolean)
    )
  expect(starterLabels).toEqual(CONVERSATION_STARTERS)

  await entry
    .getByRole("button", { name: CONVERSATION_STARTERS[0], exact: true })
    .click()
  await expect(drawer.getByText(answer, { exact: true })).toBeVisible()
  await expect(
    drawer.getByRole("button", { name: "Good response" })
  ).toBeVisible()
  await expect(
    drawer.getByRole("button", { name: "Bad response" })
  ).toBeVisible()

  expect(
    await page.evaluate(() => (window as InstrumentedWindow).__askTimFetches)
  ).toEqual([
    {
      body: JSON.stringify({
        collection_name: "content_files",
        message:         CONVERSATION_STARTERS[0],
        course_id:       COURSE_READABLE_ID
      }),
      contentType: "application/json",
      credentials: "include",
      csrfToken:   "",
      method:      "POST",
      url:         ASK_TIM_ENDPOINT
    }
  ])
})

test("a 500 response produces the generic chat error", async ({ page }) => {
  await installFeatureFlag(page, true, {
    body:   "Internal Server Error",
    status: 500
  })

  const course = new CoursePage(page, "course-v3")
  await course.goto("/")
  await waitForFeatureFlag(page)
  const { drawer } = await openAskTim(page)
  await drawer
    .getByRole("button", { name: CONVERSATION_STARTERS[0], exact: true })
    .click()

  await expect(drawer.getByRole("alert")).toContainText(
    "An unexpected error has occurred.",
    { timeout: 12_000 }
  )
  const requests = await page.evaluate(
    () => (window as InstrumentedWindow).__askTimFetches
  )
  expect(requests).toHaveLength(4)
  expect(requests.every(request => request.url === ASK_TIM_ENDPOINT)).toBe(true)
})

test("desktop drawer is capped at 900px and supports every close path", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await installFeatureFlag(page, true)
  const course = new CoursePage(page, "course-v3")
  await course.goto("/")
  await waitForFeatureFlag(page)

  const { drawer, trigger } = await openAskTim(page)
  const closeButton = drawer.getByRole("button", { name: "Close Ask TIM" })
  const courseLabel = drawer.getByText("Course", { exact: true })
  await expect(drawer).toHaveCSS("max-width", "900px")
  await expect(drawer).toHaveCSS("width", "900px")
  await expect(courseLabel).toBeVisible()
  await expect(courseLabel).toHaveCSS("color", "rgb(98, 106, 115)")
  await expect(
    drawer.getByRole("heading", { name: COURSE_TITLE, exact: true })
  ).toBeVisible()
  await expect(closeButton).toHaveCSS("width", "40px")
  await expect(closeButton).toHaveCSS("height", "40px")
  await expect(closeButton).toBeFocused()

  await page.keyboard.press("Shift+Tab")
  await expect
    .poll(() =>
      drawer.evaluate(element => element.contains(document.activeElement))
    )
    .toBe(true)

  await closeButton.click()
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(drawer).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(drawer).toBeVisible()
  await page
    .locator(".MuiModal-root .MuiBackdrop-root")
    .click({ position: { x: 20, y: 20 } })
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(drawer).toBeVisible()
  const prompt = drawer.getByRole("textbox", { name: "Ask a question" })
  await prompt.focus()
  await expect(prompt).toBeFocused()
  await page.setViewportSize({ width: 390, height: 800 })
  await expect(page.locator("#ask-tim-mobile-container")).toContainText(
    ASK_TIM_TRIGGER_NAME
  )
  await expect(prompt).toBeFocused()
  await closeButton.click()
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()
})

test("mobile drawer fills the viewport and leaves existing drawers usable", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await installFeatureFlag(page, true)
  const course = new CoursePage(page, "course-v3")
  await course.goto("/")
  await waitForFeatureFlag(page)

  const trigger = page.getByRole("button", { name: ASK_TIM_TRIGGER_NAME })
  await expect(page.locator("#ask-tim-container")).toBeEmpty()
  await expect(page.locator("#ask-tim-mobile-container")).toContainText(
    ASK_TIM_TRIGGER_NAME
  )
  await expect(trigger).toBeVisible()

  const { drawer } = await openAskTim(page)
  await expect(drawer).toHaveCSS("width", "390px")
  await expect(drawer.getByText("Course", { exact: true })).toHaveCount(0)
  await expect(
    drawer.getByRole("heading", { name: COURSE_TITLE, exact: true })
  ).toHaveCount(0)
  const closeButton = drawer.getByRole("button", { name: "Close Ask TIM" })
  const drawerBox = await drawer.boundingBox()
  const closeButtonBox = await closeButton.boundingBox()
  expect(drawerBox).not.toBeNull()
  expect(closeButtonBox).not.toBeNull()
  expect(closeButtonBox!.y - drawerBox!.y).toBe(16)
  expect(
    drawerBox!.x + drawerBox!.width - closeButtonBox!.x - closeButtonBox!.width
  ).toBe(16)

  const scrollContainer = drawer.getByTestId("ask-tim-scroll-container")
  await expect(scrollContainer).toHaveCSS("overflow-y", "auto")
  await page.setViewportSize({ width: 390, height: 400 })
  await expect
    .poll(() =>
      scrollContainer.evaluate(element =>
        Math.round(element.scrollHeight - element.clientHeight)
      )
    )
    .toBeGreaterThan(0)
  await scrollContainer.evaluate(element => {
    element.scrollTop = element.scrollHeight
  })
  await expect
    .poll(() => scrollContainer.evaluate(element => element.scrollTop))
    .toBeGreaterThan(0)

  await closeButton.click()
  await expect(drawer).toBeHidden()
  await page.setViewportSize({ width: 390, height: 844 })

  const exploreDrawer = page.locator("#mit-learn-nav-drawer")
  await page.locator("#mit-learn-menu-button-mobile").click()
  await expect(exploreDrawer).toHaveClass(/open/)
  await page.locator("#mit-learn-nav-close").click()
  await expect(exploreDrawer).not.toHaveClass(/open/)

  await course.goto("/pages/assignments")
  await expect(page.locator("#ask-tim-container")).toHaveCount(0)

  const courseInfoDrawer = page.locator("#course-info-drawer")
  await page.locator("#mobile-course-info-toggle").click()
  await expect(courseInfoDrawer).toHaveClass(/\bin\b/)
  await page.locator("#close-mobile-course-info-button").click()
  await expect(courseInfoDrawer).not.toHaveClass(/\bin\b/)
})
