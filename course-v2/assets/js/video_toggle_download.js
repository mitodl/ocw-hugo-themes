export const videoToggleDownloadPopup = () => {
  const downloadIcon = document.querySelector(".video-download-icons")
  const popup = document.querySelector(".video-tab-download-popup")
  if (downloadIcon) {
    downloadIcon.addEventListener("click", event => {
      event.stopPropagation()
      if (popup) popup.classList.toggle("hidden")
    })
  }

  document.addEventListener("click", () => {
    if (popup) {
      popup.classList.add("hidden")
    }
  })
}
