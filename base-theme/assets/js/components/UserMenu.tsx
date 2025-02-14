import React from "react"

import { RiAccountCircleFill } from "@remixicon/react"

import { useUserMe } from "../user"

export default function UserMenu() {
  const { data: user } = useUserMe()
  const learnBaseUrl = process.env.MIT_LEARN_BASEURL
  const apiBaseUrl = process.env.MIT_LEARN_API_BASEURL
  const dashboardUrl = new URL("/dashboard", learnBaseUrl).toString()
  const logoutUrl = new URL("/logout", apiBaseUrl).toString()
  const loginUrl = new URL("/login/ol-oidc", apiBaseUrl).toString()

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
      <ul className="dropdown-menu" aria-labelledby="userMenu">
        {user?.isAuthenticated ? (
          <>
            <li>
              {user.first_name} {user.last_name}
            </li>
            <li>
              <a
                className="dropdown-item"
                href={dashboardUrl}
                target="_blank"
                rel="noreferrer"
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                className="dropdown-item"
                href={logoutUrl}
                target="_blank"
                rel="noreferrer"
              >
                Logout
              </a>
            </li>
          </>
        ) : (
          <li>
            <a
              className="dropdown-item"
              href={loginUrl}
              target="_blank"
              rel="noreferrer"
            >
              Login
            </a>
          </li>
        )}
      </ul>
    </div>
  )
}
