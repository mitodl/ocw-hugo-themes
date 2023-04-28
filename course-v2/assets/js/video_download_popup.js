export const initVideoDownloadPopup = () => {
  const downloadIcons = document.querySelector(".video-download-icons")
  const popup = document.getElementById("video-tab-download-popup")
  if (downloadIcons) {
    downloadIcons.addEventListener("click", event => {
      event.stopPropagation()
      if (popup) popup.classList.toggle("hidden")
    })
  }
}
