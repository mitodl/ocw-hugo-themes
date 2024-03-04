import { MOBILE_COURSE_NAV_DRAWER_ID } from "./mobile_course_drawers"

export function initExternalLinkModal() {
  $("a.external-link-warning").on("click", _ => {
    // Close the drawer in mobile view before showing the modal.
    $(`#${MOBILE_COURSE_NAV_DRAWER_ID}`).trigger("offcanvas.close")
  })
}
