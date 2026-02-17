import { MOBILE_COURSE_NAV_DRAWER_ID } from "../../../course-v2/assets/js/mobile_course_drawers"

export const EXTERNAL_LINK_MODAL_ID = "external-link-modal"

export function initExternalLinkModal() {
  $(document).on("click", "a.external-link-warning", event => {
    event.preventDefault()

    $(`#${MOBILE_COURSE_NAV_DRAWER_ID}`).trigger("offcanvas.close")

    const targetUrl = $(event.currentTarget).attr("href")
    if (!targetUrl) {
      throw Error("External link does not have a target.")
    }

    const modal = $(`#${EXTERNAL_LINK_MODAL_ID}`)

    // Set the modal's "continue" link to the targetUrl.
    const continueButton = modal.find("a.btn-continue")
    if (!continueButton) {
      throw Error("Continue button was not found on the modal.")
    }

    continueButton.attr("href", targetUrl)

    // Remove centered class on tall screens (above 1500px)
    const TALL_SCREEN_BREAKPOINT_PX = 1500
    const TALL_SCREEN_MARGIN_CLASS = "tall-screen-top-margin"
    const modalDialog = modal.find(".modal-dialog")
    if (window.innerHeight > TALL_SCREEN_BREAKPOINT_PX) {
      modalDialog
        .removeClass("modal-dialog-centered")
        .addClass(TALL_SCREEN_MARGIN_CLASS)
    } else {
      modalDialog
        .addClass("modal-dialog-centered")
        .removeClass(TALL_SCREEN_MARGIN_CLASS)
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    modal.modal("show")
  })

  $(document).on("click", `#${EXTERNAL_LINK_MODAL_ID} .btn-continue`, _ => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    $(`#${EXTERNAL_LINK_MODAL_ID}`).modal("hide")
  })
}
