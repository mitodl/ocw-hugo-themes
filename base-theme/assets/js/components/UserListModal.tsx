import React from "react"
import { useUserMe } from "../hooks/user"
import { useUserListList, useUserListMemberList } from "../hooks/userLists"
import {
  useLearningResourceByReadableId,
  useLearningResourceSetUserListRelationships
} from "../hooks/learningResources"
import { useFormik } from "formik"
import { RiAddLine } from "@remixicon/react"
import { Button } from "@mitodl/smoot-design"

interface UserListModalProps {
  resourceReadableId: string
}

const AddToUserListModal: React.FC<UserListModalProps> = ({
  resourceReadableId
}) => {
  const { data: resource, isLoading: isResourceLoading } =
    useLearningResourceByReadableId({ readable_id: [resourceReadableId] })
  const {
    isPending: isSavingUserListRelationships,
    mutateAsync: setUserListRelationships
  } = useLearningResourceSetUserListRelationships()
  const { data: user, isLoading: isUserLoading } = useUserMe()
  const { data: userLists, isLoading: isUserListsLoading } = useUserListList()
  const { data: userListMemberships, isLoading: isUserListMembershipsLoading } =
    useUserListMemberList(resource?.id)
  const isLoading =
    isResourceLoading ||
    isUserLoading ||
    isUserListsLoading ||
    isUserListMembershipsLoading
  const apiBaseUrl = process.env.MIT_LEARN_API_BASE_URL
  const encodedLocation = encodeURI(window.location.href)
  const loginUrl = new URL(
    `/login/ol-oidc?next=${encodedLocation}`,
    apiBaseUrl
  ).toString()
  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange:   false,
    validateOnBlur:     false,
    initialValues:      {
      user_lists: userListMemberships ?? []
    },
    onSubmit: async values => {
      if (resource) {
        const newParents = values.user_lists.map(id => parseInt(id))
        await setUserListRelationships({
          id:          resource.id,
          userlist_id: newParents
        })
      }
    }
  })

  return (
    <div
      className="modal fade user-list-modal"
      id="add-to-user-list-modal"
      tabIndex={-1}
    >
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
                <form onSubmit={formik.handleSubmit}>
                  <div className="font-weight-bold pb-3">
                    Adding{" "}
                    <span className="font-italic">{resource?.title}</span>
                  </div>
                  <div className="user-list-modal-checkboxes">
                    {userLists?.results?.map(list => (
                      <div key={list.id} className="pb-3">
                        <input
                          type="checkbox"
                          name="user_lists"
                          className="form-check-input"
                          value={list.id.toString()}
                          checked={formik.values.user_lists?.includes(
                            list.id.toString()
                          )}
                          onChange={formik.handleChange}
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
                  <div id="user-list-modal-actions">
                    <div className="row">
                      <div className="col-6">
                        <Button
                          variant="primary"
                          className="w-100 h-100"
                          type="submit"
                          data-dismiss="modal"
                          disabled={
                            !formik.dirty ||
                            isLoading ||
                            isSavingUserListRelationships
                          }
                          onClick={e => {
                            e.preventDefault()
                            formik.handleSubmit()
                          }}
                          aria-label="Close and Save"
                        >
                          Save
                        </Button>
                      </div>
                      <div className="col-6">
                        <Button
                          variant="secondary"
                          className="w-100 h-100"
                          startIcon={<RiAddLine />}
                          disabled={isSavingUserListRelationships}
                          data-toggle="modal"
                          data-target="#create-user-list-modal"
                          aria-label="Create New List"
                        >
                          Create New List
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
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

export default AddToUserListModal
