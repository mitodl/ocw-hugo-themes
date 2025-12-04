import React from "react"

import { RiAccountCircleFill } from "@remixicon/react"

import { useUserMe } from "../../../../base-theme/assets/js/hooks/user"

/**
 * UserMenu component for course-v3 that matches MIT Learn's header design.
 * Same functionality as base-theme UserMenu but with MIT Learn styling.
 */
export default function UserMenu() {
  const { data: user, isLoading } = useUserMe()
  const learnBaseUrl = process.env.MIT_LEARN_BASE_URL
  const apiBaseUrl = process.env.MIT_LEARN_API_BASE_URL
  const encodedLocation = encodeURI(window.location.href)
  const myListsUrl = new URL("/dashboard/my-lists", learnBaseUrl).toString()
  const logoutUrl = new URL(
    `/logout?next=${encodedLocation}`,
    apiBaseUrl
  ).toString()
  const loginUrl = new URL(
    `/login?next=${encodedLocation}`,
    apiBaseUrl
  ).toString()

  return isLoading ? null : user?.is_authenticated ? (
    <div className="mit-learn-user-menu dropdown">
      <button
        className="mit-learn-user-menu-button dropdown-toggle"
        type="button"
        id="user-menu-button"
        data-toggle="dropdown"
        aria-expanded="false"
      >
        <RiAccountCircleFill className="mit-learn-user-icon" />
        <span className="mit-learn-user-name">{user.profile?.name}</span>
      </button>
      <div
        className="mit-learn-user-dropdown dropdown-menu dropdown-menu-right"
        aria-labelledby="user-menu-button"
      >
        <a className="mit-learn-user-dropdown-item dropdown-item" href={myListsUrl}>
          My Lists
        </a>
        <a className="mit-learn-user-dropdown-item dropdown-item" href={logoutUrl}>
          Logout
        </a>
      </div>
    </div>
  ) : (
    <div className="mit-learn-login-container">
      {/* Desktop: Text button */}
      <a
        id="login-button"
        className="mit-learn-login-button-desktop"
        href={loginUrl}
      >
        Log In
      </a>
      {/* Mobile: Icon button */}
      <a
        className="mit-learn-login-button-mobile"
        href={loginUrl}
        aria-label="Log in"
      >
        <RiAccountCircleFill className="mit-learn-user-icon" />
      </a>
    </div>
  )
}
