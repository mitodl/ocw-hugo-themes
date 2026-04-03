import React from "react"
import { render, screen } from "@testing-library/react"
import BookmarkButton from "./BookmarkButton"
import * as userHooks from "../hooks/user"
import * as lrHooks from "../hooks/learningResources"
import * as ulHooks from "../hooks/userLists"

jest.mock("../hooks/user")
jest.mock("../hooks/learningResources")
jest.mock("../hooks/userLists")
jest.mock("@mitodl/smoot-design", () => ({
  ActionButton: ({ children, ...props }: React.PropsWithChildren<object>) => (
    <button {...props}>{children}</button>
  )
}))

const mockHooks = ({
  isAuthenticated = true,
  resourceId = undefined as number | undefined,
  memberships = [] as string[]
} = {}) => {
  jest.mocked(userHooks.useUserIsAuthenticated).mockReturnValue(isAuthenticated)
  jest.mocked(lrHooks.useLearningResourceByReadableId).mockReturnValue({
    data:      resourceId !== undefined ? { id: resourceId } : undefined,
    isLoading: false
  } as ReturnType<typeof lrHooks.useLearningResourceByReadableId>)
  jest.mocked(ulHooks.useUserListMemberList).mockReturnValue({
    data:      memberships,
    isLoading: false
  } as ReturnType<typeof ulHooks.useUserListMemberList>)
}

test("renders nothing when unauthenticated", () => {
  mockHooks({ isAuthenticated: false })
  const { container } = render(
    <BookmarkButton resourceReadableId="6.001+fall_2024" />
  )
  expect(container).toBeEmptyDOMElement()
})

test("passes enabled: false to resource query when unauthenticated", () => {
  mockHooks({ isAuthenticated: false })
  render(<BookmarkButton resourceReadableId="6.001+fall_2024" />)
  expect(lrHooks.useLearningResourceByReadableId).toHaveBeenCalledWith(
    { readable_id: ["6.001+fall_2024"] },
    { enabled: false }
  )
})

test("renders button when authenticated", () => {
  mockHooks({ resourceId: 42 })
  render(<BookmarkButton resourceReadableId="6.001+fall_2024" />)
  expect(screen.getByRole("button")).toBeInTheDocument()
  expect(screen.getByRole("button")).toHaveAttribute("variant", "secondary")
  expect(lrHooks.useLearningResourceByReadableId).toHaveBeenCalledWith(
    { readable_id: ["6.001+fall_2024"] },
    { enabled: true }
  )
})

test("shows filled bookmark when resource is in user list", () => {
  mockHooks({ resourceId: 42, memberships: ["1"] })
  render(<BookmarkButton resourceReadableId="6.001+fall_2024" />)
  expect(screen.getByRole("button")).toHaveAttribute("variant", "primary")
})
