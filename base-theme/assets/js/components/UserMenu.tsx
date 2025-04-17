import React from "react"

import { RiAccountCircleFill } from "@remixicon/react"

import { useUserMe } from "../hooks/user"

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
    <div className="dropdown">
      <button
        className="btn btn-link text-white text-decoration-none dropdown-toggle"
        type="button"
        id="user-menu-button"
        data-toggle="dropdown"
        aria-expanded="false"
      >
        <RiAccountCircleFill size={24} />
        <span className="user-menu-display-name pl-2">
          {user.profile?.name}
        </span>
      </button>
      <div
        className="dropdown-menu dropdown-menu-right"
        aria-labelledby="user-menu-button"
      >
        <a className="dropdown-item text-capitalize" href={myListsUrl}>
          My Lists
        </a>
        <a className="dropdown-item text-capitalize" href={logoutUrl}>
          Logout
        </a>
      </div>
    </div>
  ) : (
    <a
      id="login-button"
      className="btn btn-light text-capitalize text-decoration-none font-weight-bold"
      href={loginUrl}
    >
      Log In
    </a>
  )
}
