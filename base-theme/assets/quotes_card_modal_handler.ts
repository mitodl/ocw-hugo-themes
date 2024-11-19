export function initQuotesModalHandler() {
  $(document).ready(() => {
    const modalElement = $("#exampleModalCenter")

    let carouselId: string | undefined

    $(".js-modal-trigger").on("click", event => {
      event.preventDefault()

      const target = $(event.currentTarget)
      const modalContentId = target.data("modal-content-id")
      const contentDiv = $(`#${modalContentId}`)

      const carouselElement = target.closest(".carousel")
      carouselId = carouselElement.attr("id")

      if (contentDiv.length) {
        const content = contentDiv.html()
        modalElement.find(".modal-body").html(content)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        modalElement.modal("show")
      } else {
        console.error("Modal content not found for ID:", modalContentId)
      }
    })

    modalElement.on("shown.bs.modal", () => {
      modalElement.focus()
    })

    modalElement.on("hidden.bs.modal", () => {
      if (carouselId) {
        $(`#${carouselId}`).focus()
      }
    })
  })
}
