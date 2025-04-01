import { useUserListCreate } from "../hooks/userLists"
import { FormikConfig, useFormik } from "formik"
import * as Yup from "yup"
import { useCallback } from "react"
import { Button, TextField } from "@mitodl/smoot-design"
import { Alert } from "react-bootstrap"

const variantProps = { InputLabelProps: { shrink: true } }

const userListFormSchema = Yup.object().shape({
  title:       Yup.string().default("").required("Title is required"),
  description: Yup.string().default("").required("Description is required")
})

type UserListFormValues = Yup.InferType<typeof userListFormSchema>

const UpsertUserListDialog: React.FC = () => {
  const createList = useUserListCreate()
  const handleSubmit: FormikConfig<UserListFormValues>["onSubmit"] =
    useCallback(
      async values => {
        await createList.mutateAsync(values)
      },
      [createList]
    )

  const formik = useFormik({
    enableReinitialize: true,
    initialValues:      userListFormSchema.getDefault() as UserListFormValues,
    validationSchema:   userListFormSchema,
    onSubmit:           handleSubmit,
    validateOnChange:   false,
    validateOnBlur:     false
  })

  return (
    <div
      className="modal fade user-list-modal"
      id="create-user-list-modal"
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-capitalize">Create User List</h5>
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
          <div className="modal-body">
            <form
              title="Create User List"
              className="create-user-list-form"
              onSubmit={formik.handleSubmit}
            >
              <TextField
                type="text"
                multiline={false}
                minRows={undefined}
                inputProps={undefined}
                name="title"
                label="Title"
                placeholder="My list of favorite courses"
                value={formik.values.title}
                error={!!formik.errors.title}
                errorText={formik.errors.title}
                onChange={formik.handleChange}
                {...variantProps}
                fullWidth
                required
              />
              <TextField
                type="text"
                inputProps={undefined}
                label="Description"
                name="description"
                placeholder="List of all courses I wanted to check out"
                value={formik.values.description}
                error={!!formik.errors.description}
                errorText={formik.errors.description}
                onChange={formik.handleChange}
                {...variantProps}
                fullWidth
                multiline
                minRows={3}
                required
              />
              {createList.isError && !formik.isSubmitting && (
                <Alert variant="danger" className="mt-3">
                  There was a problem saving your list. Please try again later.
                </Alert>
              )}
              <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" data-dismiss="modal">
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpsertUserListDialog
