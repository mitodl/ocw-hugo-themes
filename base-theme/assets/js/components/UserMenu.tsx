import React from "react"

import { RiAccountCircleFill } from "@remixicon/react"

import { useUserMe } from "../user"

export default function UserMenu() {
  const { data: user, isLoading } = useUserMe()
  const learnBaseUrl = process.env.MIT_LEARN_BASEURL
  const apiBaseUrl = process.env.MIT_LEARN_API_BASEURL
  const encodedLocation = encodeURI(window.location.href)
  const dashboardUrl = new URL("/dashboard", learnBaseUrl).toString()
  const logoutUrl = new URL(`/logout?redirect_uri=${encodedLocation}`, apiBaseUrl).toString()
  const loginUrl = new URL(`/login/ol-oidc?redirect_uri=${encodedLocation}`, apiBaseUrl).toString()

  return (
    <div className="dropdown">
      <button
        className="btn btn-link dropdown-toggle"
        type="button"
        id="userMenu"
        data-toggle="dropdown"
        aria-expanded="false"
      >
        <RiAccountCircleFill size={24} />
      </button>
      <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userMenu">
        {!isLoading ? (
          user?.isAuthenticated ? (
          <>
            <div className="px-3 py-2">
              {user.first_name} {user.last_name}
            </div>
            <a
              className="dropdown-item text-capitalize"
              href={dashboardUrl}
              rel="noreferrer"
            >
              Dashboard
            </a>
            <a
              className="dropdown-item text-capitalize"
              href={logoutUrl}
              rel="noreferrer"
            >
              Logout
            </a>
          </>
        ) : (
          <a
            className="dropdown-item text-capitalize"
            href={loginUrl}
            rel="noreferrer"
          >
            Login
          </a>
        )
      ) : (
        <div className="dropdown-item text-capitalize">Loading...</div>
      )}
      </div>
    </div>
  )
}
