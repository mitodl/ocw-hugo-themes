export function initQuotesModalHandler() {
  $(document).ready(() => {
    const modalElement = $(".js-quote-modal")

    $(".js-modal-trigger").on("click", event => {
      event.preventDefault()

      const target = $(event.currentTarget)
      const modalContentId = target.data("modal-content-id")
      const contentDiv = $(`#${modalContentId}`)

      if (contentDiv.length) {
        const content = contentDiv.html()
        modalElement.find(".modal-body.quote-modal-body").html(content)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        modalElement.modal("show")
      } else {
        console.error("Modal content not found for ID:", modalContentId)
      }
    })
  })
}
