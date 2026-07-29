export const initVideoDownloadPopup = () => {
  const downloadIcons = document.querySelectorAll(".video-download-icons")
  const popups = document.querySelectorAll(".video-tab-download-popup")
  let activePopup: HTMLElement | null = null
  let activeIcon: Element | null = null

  function resetPopupToMainMenu(popup: HTMLElement) {
    popup.removeAttribute("data-view")
  }

  function closeActivePopup() {
    if (!activePopup) return
    activeIcon?.setAttribute("aria-expanded", "false")
    activePopup.classList.add("hidden")
    resetPopupToMainMenu(activePopup)
    activePopup = null
    activeIcon = null
  }

  downloadIcons.forEach(downloadIcon => {
    // Resolve the popup from the icon's own tab section, not by document index.
    const popup = downloadIcon
      .closest(".video-tab-toggle-section")
      ?.querySelector(".video-tab-download-popup") as HTMLElement | null
    if (!popup) return

    downloadIcon.addEventListener("click", event => {
      event.stopPropagation()
      const wasActive = popup === activePopup
      closeActivePopup()
      // Clicking the open popup's own button just closes it
      if (wasActive) return
      downloadIcon.setAttribute("aria-expanded", "true")
      popup.classList.remove("hidden")
      activePopup = popup
      activeIcon = downloadIcon
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
  const transcriptLangBtns = document.querySelectorAll(
    ".transcript-lang-dropdown-btn"
  )
  transcriptLangBtns.forEach(btn => {
    const htmlBtn = btn as HTMLElement
    const dropdown = btn.closest(".transcript-lang-dropdown") as HTMLElement
    const menu = dropdown?.querySelector(
      ".transcript-lang-dropdown-menu"
    ) as HTMLElement | null

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
    closeActivePopup()
    transcriptLangBtns.forEach(btn => {
      const htmlBtn = btn as HTMLElement
      const dropdown = btn.closest(".transcript-lang-dropdown") as HTMLElement
      const menu = dropdown?.querySelector(
        ".transcript-lang-dropdown-menu"
      ) as HTMLElement | null
      htmlBtn.setAttribute("aria-expanded", "false")
      menu?.classList.add("hidden")
    })
  })
}
