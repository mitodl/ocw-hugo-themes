export const updateContent = (
  /** @type {{ getAttribute: (arg0: string) => any; }} */ element
) => {
  console.log("inside")
  const modalContentId = element.getAttribute("data-modal-content-id")
  const contentDiv = document.getElementById(modalContentId)

  if (contentDiv) {
    const content = contentDiv.innerHTML
    const modalElement = document.getElementById("exampleModalCenter")
    // @ts-ignore
    modalElement.querySelector(".modal-body").innerHTML = content
  } else {
    console.error("Modal content not found for ID:", modalContentId)
  }
}

export const initModalHandler = () => {
  console.log("Modal handler initialized.")
  const modalTriggers = document.querySelectorAll(".js-modal-trigger")
  modalTriggers.forEach(trigger => {
    trigger.addEventListener("click", event => {
      event.preventDefault()
      updateContent(trigger)
    })
  })
}
