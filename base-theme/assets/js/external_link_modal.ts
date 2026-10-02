import { MOBILE_COURSE_NAV_DRAWER_ID } from "../../../course-v2/assets/js/mobile_course_drawers"

export const EXTERNAL_LINK_MODAL_ID = "external-link-modal"

/** Where the "Continue" link sends the reader, set per click. */
const CONTINUE_SELECTOR = "a.btn-continue"

/**
 * Close the mobile nav drawer, if one is open, before showing the warning.
 * Shared by both implementations below.
 */
function closeMobileDrawer(): void {
  $(`#${MOBILE_COURSE_NAV_DRAWER_ID}`).trigger("offcanvas.close")
}

function targetUrlOf(event: JQuery.ClickEvent): string {
  const targetUrl = $(event.currentTarget).attr("href")
  if (!targetUrl) {
    throw Error("External link does not have a target.")
  }
  return targetUrl
}

/**
 * The v3 implementation: the markup is a native <dialog>, so showModal() does
 * the work. See course-v3/layouts/partials/external_link_modal.html for why.
 *
 * Everything this used to need code for is now the platform's job. The top
 * layer paints it above an open image-gallery lightbox without re-parenting;
 * the rest of the page — the lightbox included — goes inert, so the gallery's
 * arrow keys cannot fire behind it; Escape closes it; and close() restores
 * focus to whatever was focused before showModal().
 */
function initExternalLinkDialog(dialog: HTMLDialogElement): void {
  const continueLink =
    dialog.querySelector<HTMLAnchorElement>(CONTINUE_SELECTOR)
  if (!continueLink) {
    throw Error("Continue button was not found on the modal.")
  }

  $(document).on("click", "a.external-link-warning", event => {
    event.preventDefault()
    closeMobileDrawer()
    continueLink.setAttribute("href", targetUrlOf(event))

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

/**
 * The v2/www implementation, unchanged in behaviour: a Bootstrap 4 modal.
 */
function initExternalLinkBootstrapModal(): void {
  $(document).on("click", "a.external-link-warning", event => {
    event.preventDefault()
    closeMobileDrawer()

    const modal = $(`#${EXTERNAL_LINK_MODAL_ID}`)
    const continueButton = modal.find(CONTINUE_SELECTOR)
    if (!continueButton) {
      throw Error("Continue button was not found on the modal.")
    }
    continueButton.attr("href", targetUrlOf(event))

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

/**
 * Picks an implementation from the markup that is actually on the page, rather
 * than from a build flag: course-v3 overrides the partial with a <dialog>,
 * every other theme keeps base-theme's Bootstrap markup. base-theme/assets
 * /index.ts is in every bundle, so this one entry point has to serve both.
 */
export function initExternalLinkModal(): void {
  const modal = document.getElementById(EXTERNAL_LINK_MODAL_ID)
  if (
    modal instanceof HTMLDialogElement &&
    typeof modal.showModal === "function"
  ) {
    initExternalLinkDialog(modal)
    return
  }
  initExternalLinkBootstrapModal()
}
