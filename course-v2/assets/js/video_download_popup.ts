export const initVideoDownloadPopup = () => {
  const downloadIcons = document.querySelectorAll(".video-download-icons")
  const popups = document.querySelectorAll(".video-tab-download-popup")
  let activePopup: HTMLElement | null = null
  let activePopupDownloadIconIndex = -1

  downloadIcons.forEach((downloadIcon, index) => {
    const popup = popups[index] as HTMLElement
    downloadIcon.addEventListener("click", event => {
      event.stopPropagation()
      if (popup === activePopup) {
        // Clicked on the same download button, toggle the popup
        downloadIcon.setAttribute("aria-expanded", "false")
        popup.classList.toggle("hidden")
        activePopup = null
      } else {
        // Clicked on a different download button, close previous popup (if any) and toggle open new popup
        if (activePopup) {
          downloadIcons[activePopupDownloadIconIndex].setAttribute(
            "aria-expanded",
            "false"
          )
          activePopup.classList.add("hidden")
        }
        // Show the clicked popup
        downloadIcon.setAttribute("aria-expanded", "true")
        popup.classList.remove("hidden")
        activePopup = popup
        activePopupDownloadIconIndex = index
      }
    })
  })
  // Click anywhere on page (other than download buttons), and the active popup will close
  document.addEventListener("click", () => {
    if (activePopup) {
      downloadIcons[activePopupDownloadIconIndex].setAttribute(
        "aria-expanded",
        "false"
      )
      activePopup.classList.add("hidden")
      activePopup = null
    }
  })
}
