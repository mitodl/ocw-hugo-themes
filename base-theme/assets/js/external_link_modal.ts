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

    // A native <dialog> shown via showModal() (the image gallery lightbox) paints
    // in the browser's top layer, above the rest of the document regardless of
    // z-index — this modal's own fixed-position markup included, so it would
    // otherwise show up invisibly behind an open dialog. Re-parenting it into
    // the dialog that triggered it puts it back in that same top layer, above
    // the dialog's own content; re-parenting it back under <body> once the
    // trigger is elsewhere (the common case) keeps every other page unchanged.
    const triggerDialog = (event.currentTarget as HTMLElement).closest(
      "dialog[open]"
    )
    const modalEl = modal[0]
    const targetParent = triggerDialog ?? document.body
    if (modalEl.parentElement !== targetParent) {
      targetParent.appendChild(modalEl)
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
