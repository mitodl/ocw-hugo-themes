export const initVideoDownloadPopup = () => {
  const downloadIcons = document.querySelectorAll(".video-download-icons")
  const popups = document.querySelectorAll(".video-tab-download-popup")

  if (downloadIcons.length > 0) {
    downloadIcons.forEach((downloadIcon, index) => {
      const popup = popups[index]
      downloadIcon.addEventListener("click", event => {
        event.stopPropagation()
        if (popup) popup.classList.toggle("hidden")
      })
    })
  }

  document.addEventListener("click", () => {
    popups.forEach(popup => {
      popup.classList.add("hidden")
    })
  })
}
