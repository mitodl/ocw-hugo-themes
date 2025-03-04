import React from "react"
import { useUserMe } from "../hooks/user"

export default function UserListModal() {
  const { data: user, isLoading } = useUserMe()
  const apiBaseUrl = process.env.MIT_LEARN_API_BASEURL
  const encodedLocation = encodeURI(window.location.href)
  const loginUrl = new URL(
    `/login/ol-oidc?next=${encodedLocation}`,
    apiBaseUrl
  ).toString()

  return (
    <div className="modal fade" id="user-list-modal" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add to User List</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {!isLoading ? (
              user?.isAuthenticated ? (
                <div>Coming Soon</div>
              ) : (
                <a className="dropdown-item text-capitalize" href={loginUrl}>
                  Login
                </a>
              )
            ) : (
              <div className="dropdown-item text-capitalize">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
