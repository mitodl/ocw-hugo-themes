export const initVideoDownloadPopup = () => {
  const downloadIcons = document.querySelectorAll(".video-download-icons")
  const popups = document.querySelectorAll(".video-tab-download-popup")
  let activePopup: HTMLElement | null = null
  let activePopupDownloadIconIndex = -1

  function resetPopupToMainMenu(popup: HTMLElement) {
    popup.removeAttribute("data-view")
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
    const openSubmenuBtn = p.querySelector(".download-transcript-submenu-btn")
    const backBtn = p.querySelector(".download-submenu-back-btn")

    openSubmenuBtn?.addEventListener("click", event => {
      event.stopPropagation()
      p.setAttribute("data-view", "submenu")
    })

    backBtn?.addEventListener("click", event => {
      event.stopPropagation()
      p.removeAttribute("data-view")
    })
  })

  // Wire transcript language dropdowns
  const transcriptLangBtns = document.querySelectorAll(".transcript-lang-dropdown-btn")
  transcriptLangBtns.forEach(btn => {
    const htmlBtn = btn as HTMLElement
    const dropdown = btn.closest(".transcript-lang-dropdown") as HTMLElement
    const menu = dropdown?.querySelector(".transcript-lang-dropdown-menu") as HTMLElement | null

    htmlBtn.addEventListener("click", event => {
      event.stopPropagation()
      const isOpen = htmlBtn.getAttribute("aria-expanded") === "true"
      htmlBtn.setAttribute("aria-expanded", isOpen ? "false" : "true")
      if (isOpen) {
        menu?.classList.add("hidden")
      } else {
        menu?.classList.remove("hidden")
      }
    })

    menu?.querySelectorAll(".transcript-lang-option").forEach(option => {
      const htmlOption = option as HTMLElement
      htmlOption.addEventListener("click", event => {
        event.stopPropagation()
        // Update trigger button text
        const btnText = htmlBtn.querySelector(".transcript-lang-btn-text")
        if (btnText) btnText.textContent = htmlOption.textContent?.trim() ?? ""
        // Update active state
        menu?.querySelectorAll(".transcript-lang-option").forEach(o => {
          o.classList.remove("active")
          o.setAttribute("aria-selected", "false")
        })
        htmlOption.classList.add("active")
        htmlOption.setAttribute("aria-selected", "true")
        // Close dropdown
        htmlBtn.setAttribute("aria-expanded", "false")
        menu?.classList.add("hidden")
      })
    })
  })

  // Click anywhere on page: close active popup and any open transcript dropdowns
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
    transcriptLangBtns.forEach(btn => {
      const htmlBtn = btn as HTMLElement
      const dropdown = btn.closest(".transcript-lang-dropdown") as HTMLElement
      const menu = dropdown?.querySelector(".transcript-lang-dropdown-menu") as HTMLElement | null
      htmlBtn.setAttribute("aria-expanded", "false")
      menu?.classList.add("hidden")
    })
  })
}
