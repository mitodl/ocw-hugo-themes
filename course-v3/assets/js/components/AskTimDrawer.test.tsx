import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AiChat } from "@mitodl/smoot-design/ai"
import AskTimDrawer, { COURSE_CONVERSATION_STARTERS } from "./AskTimDrawer"

jest.mock("@mitodl/smoot-design", () => ({
  ActionButton: ({
    children,
    edge: _edge,
    size: _size,
    variant: _variant,
    ...props
  }: React.PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      edge?: string
      size?: string
      variant?: string
    }
  >) => <button {...props}>{children}</button>
}))

jest.mock("@mitodl/smoot-design/ai", () => ({
  AiChat: jest.fn(() => <div data-testid="ai-chat" />)
}))

jest.mock("@mui/material/Drawer", () => ({
  __esModule: true,
  default:    ({ children, open }: React.PropsWithChildren<{ open: boolean }>) =>
    open ? <div role="dialog">{children}</div> : null
}))

const aiChatMock = jest.mocked(AiChat)
const originalCsrfCookieName = process.env.CSRF_COOKIE_NAME

const renderDrawer = (onClose = jest.fn()) => {
  const result = render(
    <AskTimDrawer
      apiBaseUrl="https://api.test/root///"
      courseTitle="Structure and Interpretation"
      onClose={onClose}
      open
      readableId="6.001+fall_2024"
    />
  )
  return { ...result, onClose }
}

beforeEach(() => {
  process.env.CSRF_COOKIE_NAME = "ocw-csrf"
})

afterAll(() => {
  process.env.CSRF_COOKIE_NAME = originalCsrfCookieName
})

test("configures AiChat with the exact course conversation contract", () => {
  renderDrawer()

  expect(screen.getByTestId("ai-chat")).toBeInTheDocument()
  const props = aiChatMock.mock.calls[0][0]
  expect(props.chatId).toBe("6.001+fall_2024")
  expect(props.entryScreenTitle).toBe(
    "What do you want to know about this course?"
  )
  expect(props.conversationStarters).toEqual([
    { content: "What is this course about?" },
    { content: "What are the prerequisites for this course?" },
    { content: "How will this course be graded?" }
  ])
  expect(props.conversationStarters).toBe(COURSE_CONVERSATION_STARTERS)
  expect(props.requestOpts).toMatchObject({
    apiUrl:         "https://api.test/root/ai/http/syllabus_agent/",
    csrfCookieName: "ocw-csrf",
    csrfHeaderName: "X-CSRFToken",
    fetchOpts:      { credentials: "include" }
  })
})

test("sends the latest user message and course readable ID", () => {
  renderDrawer()
  const transformBody = aiChatMock.mock.calls[0][0].requestOpts?.transformBody
  if (!transformBody) throw new Error("AiChat transformBody was not configured")

  const messages = [
    { id: "1", role: "user", content: "First question" },
    { id: "2", role: "assistant", content: "First answer" },
    { id: "3", role: "user", content: "Latest question" },
    { id: "4", role: "assistant", content: "Latest answer" }
  ] as Parameters<typeof transformBody>[0]

  expect(transformBody(messages)).toEqual({
    collection_name: "content_files",
    message:         "Latest question",
    course_id:       "6.001+fall_2024"
  })
})

test("renders the course title and invokes the close control", async () => {
  const user = userEvent.setup()
  const { onClose } = renderDrawer()

  expect(screen.getByRole("heading", { name: "Ask TIM" })).toBeInTheDocument()
  expect(screen.getByText("Structure and Interpretation")).toBeInTheDocument()
  const closeButton = screen.getByRole("button", { name: "Close Ask TIM" })
  expect(closeButton).toHaveFocus()

  await user.click(closeButton)

  expect(onClose).toHaveBeenCalledTimes(1)
})
