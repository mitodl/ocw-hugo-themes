import { MOBILE_COURSE_NAV_DRAWER_ID } from "../../../course-v2/assets/js/mobile_course_drawers"

export const EXTERNAL_LINK_MODAL_ID = "external-link-modal"

/**
 * The course-v3 implementation. course-v3 overrides external_link_modal.html
 * with a native <dialog> (see that partial for why), so showModal() does the
 * work: the top layer paints it above an open image-gallery lightbox without
 * re-parenting; the rest of the page — the lightbox included — goes inert, so
 * the gallery's arrow keys cannot fire behind it; Escape closes it; and
 * close() restores focus to whatever was focused before showModal().
 *
 * Self-contained on purpose. Every other theme runs the Bootstrap code in
 * initExternalLinkModal() below, and that code is left exactly as it was.
 */
function initExternalLinkDialog(dialog: HTMLDialogElement): void {
  const continueLink = dialog.querySelector<HTMLAnchorElement>("a.btn-continue")
  if (!continueLink) {
    throw Error("Continue button was not found on the modal.")
  }

  $(document).on("click", "a.external-link-warning", event => {
    event.preventDefault()

    $(`#${MOBILE_COURSE_NAV_DRAWER_ID}`).trigger("offcanvas.close")

    const targetUrl = $(event.currentTarget).attr("href")
    if (!targetUrl) {
      throw Error("External link does not have a target.")
    }
    continueLink.setAttribute("href", targetUrl)

    // Focus the trigger before showModal(). close() restores focus to whatever
    // was focused at the moment it opened, and preventDefault() above stops
    // the click focusing the link itself — the same reason the lightbox
    // focuses its trigger explicitly.
    ;(event.currentTarget as HTMLElement).focus({ preventScroll: true })
    dialog.showModal()
  })

  dialog.addEventListener("click", event => {
    const target = event.target as Element | null
    // event.target is the dialog itself only for a click on its ::backdrop,
    // because the dialog is sized to its content. Matches what Bootstrap's
    // backdrop did.
    if (target === dialog || target?.closest("[data-external-link-dismiss]")) {
      dialog.close()
    }
  })

  // "Continue" opens in a new tab; drop the warning behind it so returning to
  // this tab does not land back on it.
  continueLink.addEventListener("click", () => dialog.close())
}

export function initExternalLinkModal() {
  // base-theme/assets/index.ts is in every bundle, so the implementation is
  // picked from the markup on the page rather than a build flag. Only
  // course-v3's override is a <dialog>; course-v2 and www render base-theme's
  // Bootstrap markup and fall through to the code below, unchanged.
  const dialog = document.getElementById(EXTERNAL_LINK_MODAL_ID)
  if (
    dialog instanceof HTMLDialogElement &&
    typeof dialog.showModal === "function"
  ) {
    initExternalLinkDialog(dialog)
    return
  }

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
