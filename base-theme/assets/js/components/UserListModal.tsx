import React from "react"
import { useUserMe } from "../hooks/user"
import { useUserListList } from "../hooks/userLists"

export default function UserListModal() {
  const { data: user, isLoading } = useUserMe()
  const { data: userLists, isLoading: isUserListsLoading } = useUserListList()
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
            <h5 className="modal-title text-capitalize">Add to User List</h5>
            <button
              type="button"
              className="btn-close btn-light"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <i className="material-icons display-4 text-black align-bottom">close</i>
            </button>
          </div>
          <div className="modal-body">
            {!isLoading ? (
              user?.isAuthenticated ? (
                <div>
                  <ul className="list-group">
                    {isUserListsLoading ? (
                      <li className="list-group-item">Loading...</li>
                    ) : (
                      userLists?.results.map((list) => (
                        <li
                          key={list.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {list.title}
                          <button className="btn btn-primary">Add</button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
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
