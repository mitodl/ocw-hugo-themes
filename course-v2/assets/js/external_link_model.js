export function initExternalLinkModal() {
  $("a.external-link").on("click", event => {
    event.preventDefault()

    const targetUrl = event.target.getAttribute("href") ?? "#"
    const modal = $("#external-link-modal")

    // Set the modal's "continue" link to the targetUrl.
    modal.find("a.btn-continue").attr("href", targetUrl)

    // @ts-ignore
    modal.modal("show")
  })
}
