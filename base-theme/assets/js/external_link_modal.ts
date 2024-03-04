export const EXTERNAL_LINK_MODAL_ID = "external-link-modal"

export function initExternalLinkModal() {
  $("a.external-link-warning").on("click", event => {
    event.preventDefault()

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

  $(`#${EXTERNAL_LINK_MODAL_ID} .btn-continue`).on("click", _ => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    $(`#${EXTERNAL_LINK_MODAL_ID}`).modal("hide")
  })
}
