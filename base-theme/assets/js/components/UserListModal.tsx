import React from "react"
import { useUserMe } from "../hooks/user"
import { useUserListList } from "../hooks/userLists"
import { useLearningResourceByReadableId } from "../hooks/learningResources"

interface UserListModalProps {
  resourceReadableId: string
}

const UserListModal: React.FC<UserListModalProps> = ({
  resourceReadableId
}) => {
  const { data: resource, isLoading: isResourceLoading } =
    useLearningResourceByReadableId({ readable_id: [resourceReadableId] })
  const { data: user, isLoading: isUserLoading } = useUserMe()
  const { data: userLists, isLoading: isUserListsLoading } = useUserListList()
  const isLoading = isResourceLoading || isUserLoading || isUserListsLoading
  const apiBaseUrl = process.env.MIT_LEARN_API_BASE_URL
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
              data-dismiss="modal"
              aria-label="Close"
            >
              <i className="material-icons display-4 text-black align-bottom">
                close
              </i>
            </button>
          </div>
          {!isLoading ? (
            user?.isAuthenticated ? (
              <div className="modal-body">
                <div>{resource?.title}</div>
                <div className="user-list-modal-checkboxes">
                  {userLists?.results.map(list => (
                    <div key={list.id}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`list-${list.id}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`list-${list.id}`}
                      >
                        {list.title}
                      </label>
                    </div>
                  ))}
                </div>
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
  )
}

export default UserListModal
