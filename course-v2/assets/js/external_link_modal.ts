import { MOBILE_COURSE_NAV_DRAWER_ID } from "./mobile_course_drawers"

export const EXTERNAL_LINK_MODAL_ID = "external-link-modal"

export function initExternalLinkModal() {
  $("a.external-link").on("click", event => {
    event.preventDefault()

    // Close the drawer in mobile view before showing the modal.
    $(`#${MOBILE_COURSE_NAV_DRAWER_ID}`).trigger("offcanvas.close")

    const targetUrl = event.target.getAttribute("href") ?? "#"
    const modal = $(`#${EXTERNAL_LINK_MODAL_ID}`)

    // Set the modal's "continue" link to the targetUrl.
    modal.find("a.btn-continue").attr("href", targetUrl)

    // @ts-ignore
    modal.modal("show")
  })
}
