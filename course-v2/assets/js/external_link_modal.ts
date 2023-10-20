import { MOBILE_COURSE_NAV_DRAWER_ID } from "./mobile_course_drawers"

export const EXTERNAL_LINK_MODAL_ID = "external-link-modal"

export function initExternalLinkModal() {
  $("a.external-link").on("click", event => {
    event.preventDefault()

    // Close the drawer in mobile view before showing the modal.
    $(`#${MOBILE_COURSE_NAV_DRAWER_ID}`).trigger("offcanvas.close")

    const targetUrl = $(event.currentTarget).data("target-url")
    if (!targetUrl) {
      throw Error("External link does not have a target.")
    }

    const modal = $(`#${EXTERNAL_LINK_MODAL_ID}`)

    // Set the modal's "continue" link to the targetUrl.
    const continueButton = modal.find("a.btn-continue")

    if (continueButton) {
      continueButton.attr("href", targetUrl)
    } else {
      throw Error("Continue button was not found on the modal.")
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    modal.modal("show")
  })
}
