import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "@mitodl/smoot-design"
import UserMenu from "./UserMenu"
import * as userHooks from "../hooks/user"

jest.mock("../hooks/user")

const LEARN_BASE_URL = "https://learn.example.com"
const API_BASE_URL = "https://api.learn.example.com"

const mockUser = ({
  name = undefined as string | undefined,
  isAuthenticated = false,
  isLoading = false
} = {}) => {
  jest.mocked(userHooks.useUserMe).mockReturnValue({
    data: isAuthenticated ?
      { is_authenticated: true, profile: { name } } :
      { is_authenticated: false },
    isLoading
  } as ReturnType<typeof userHooks.useUserMe>)
}

const renderMenu = (props: Parameters<typeof UserMenu>[0] = {}) =>
  render(
    <ThemeProvider>
      <UserMenu {...props} />
    </ThemeProvider>
  )

beforeEach(() => {
  process.env.MIT_LEARN_BASE_URL = LEARN_BASE_URL
  process.env.MIT_LEARN_API_BASE_URL = API_BASE_URL
})

test("renders nothing while the user is loading", () => {
  mockUser({ isLoading: true })
  const { container } = renderMenu()
  expect(container).toBeEmptyDOMElement()
})

test("renders a login link back to the current page when logged out", () => {
  mockUser()
  renderMenu()
  const login = screen.getByRole("link", { name: "Log In" })
  expect(login).toHaveAttribute(
    "href",
    `${API_BASE_URL}/login?next=${encodeURI(window.location.href)}`
  )
})

test("renders the icon-only login affordance for the mobile variant", () => {
  mockUser()
  renderMenu({ variant: "mobile" })
  expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument()
  expect(screen.queryByText("Log In")).not.toBeInTheDocument()
})

test("renders the user's name and menu items when logged in", async () => {
  mockUser({ isAuthenticated: true, name: "Ada Lovelace" })
  renderMenu()

  expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
  await userEvent.click(screen.getByRole("button", { name: "User Menu" }))

  // Order matters: MIT Learn leads with Dashboard and ends with Log Out.
  expect(screen.getAllByRole("menuitem").map(item => item.textContent)).toEqual(
    ["Dashboard", "My Lists", "Log Out"]
  )

  expect(screen.getByRole("menuitem", { name: "Dashboard" })).toHaveAttribute(
    "href",
    `${LEARN_BASE_URL}/dashboard`
  )
  expect(screen.getByRole("menuitem", { name: "My Lists" })).toHaveAttribute(
    "href",
    `${LEARN_BASE_URL}/dashboard/my-lists`
  )
  expect(screen.getByRole("menuitem", { name: "Log Out" })).toHaveAttribute(
    "href",
    `${API_BASE_URL}/logout?next=${encodeURI(window.location.href)}`
  )
})
