export const initVideoDownloadPopup = () => {
  const downloadIcons = document.querySelectorAll(".video-download-icons")
  const popups = document.querySelectorAll(".video-tab-download-popup")
  let activePopup: HTMLElement | null = null
  let activePopupDownloadIconIndex = -1

  function resetPopupToMainMenu(popup: HTMLElement) {
    const mainMenu = popup.querySelector(".download-menu-main") as HTMLElement | null
    const subMenu = popup.querySelector(".download-menu-submenu") as HTMLElement | null
    if (mainMenu) mainMenu.classList.remove("hidden")
    if (subMenu) subMenu.classList.add("hidden")
  }

  downloadIcons.forEach((downloadIcon, index) => {
    const popup = popups[index] as HTMLElement
    downloadIcon.addEventListener("click", event => {
      event.stopPropagation()
      if (popup === activePopup) {
        // Clicked on the same download button, toggle the popup
        downloadIcon.setAttribute("aria-expanded", "false")
        popup.classList.toggle("hidden")
        resetPopupToMainMenu(popup)
        activePopup = null
      } else {
        // Clicked on a different download button, close previous popup (if any) and toggle open new popup
        if (activePopup) {
          downloadIcons[activePopupDownloadIconIndex].setAttribute(
            "aria-expanded",
            "false"
          )
          activePopup.classList.add("hidden")
          resetPopupToMainMenu(activePopup)
        }
        // Show the clicked popup
        downloadIcon.setAttribute("aria-expanded", "true")
        popup.classList.remove("hidden")
        activePopup = popup
        activePopupDownloadIconIndex = index
      }
    })
  })

  // Wire sub-menu navigation within each popup
  popups.forEach(popup => {
    const p = popup as HTMLElement
    const mainMenu = p.querySelector(".download-menu-main") as HTMLElement | null
    const subMenu = p.querySelector(".download-menu-submenu") as HTMLElement | null
    const openSubmenuBtn = p.querySelector(".download-transcript-submenu-btn")
    const backBtn = p.querySelector(".download-submenu-back-btn")

    openSubmenuBtn?.addEventListener("click", event => {
      event.stopPropagation()
      mainMenu?.classList.add("hidden")
      subMenu?.classList.remove("hidden")
    })

    backBtn?.addEventListener("click", event => {
      event.stopPropagation()
      subMenu?.classList.add("hidden")
      mainMenu?.classList.remove("hidden")
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
      resetPopupToMainMenu(activePopup)
      activePopup = null
    }
  })
}
