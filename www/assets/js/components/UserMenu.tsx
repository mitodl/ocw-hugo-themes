import React from "react"

import {
  RiAccountCircleFill,
} from "@remixicon/react"

import { useUserMe } from "../hooks/user"

export default function UserMenu() {
  const { data: user } = useUserMe()

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
        {user?.is_authenticated ? (
          <>
            <li>
              {user.first_name} {user.last_name}
            </li>
            <li>
              <a className="dropdown-item" href="https://learn.dev.c4103.com/dashboard" target="_blank">
                Dashboard
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="https://learn.dev.c4103.com/logout" target="_blank">
                Logout
              </a>
            </li>
          </>
        ) : (
          <li>
            <a className="dropdown-item" href="https://learn.dev.c4103.com/login" target="_blank">
              Login
            </a>
          </li>
        )}
      </ul>
    </div>
  )
}