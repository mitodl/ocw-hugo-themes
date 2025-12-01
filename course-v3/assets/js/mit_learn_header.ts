/**
 * MIT Learn Header - Navigation Drawer functionality
 *
 * Initializes the header menu button and navigation drawer interactions.
 */

export function initMITLearnHeader(): void {
  const desktopMenuButton = document.getElementById("mit-learn-menu-button-desktop")
  const mobileMenuButton = document.getElementById("mit-learn-menu-button-mobile")
  const navDrawer = document.getElementById("mit-learn-nav-drawer")
  const navCloseButton = document.getElementById("mit-learn-nav-close")
  const backdrop = document.getElementById("mit-learn-nav-backdrop")

  if (!navDrawer) {
    return
  }

  let isOpen = false

  const openDrawer = (): void => {
    isOpen = true
    navDrawer.classList.add("open")
    navDrawer.setAttribute("aria-hidden", "false")
    backdrop?.classList.add("visible")

    // Update button states
    desktopMenuButton?.setAttribute("aria-expanded", "true")
    mobileMenuButton?.setAttribute("aria-expanded", "true")

    // Trap focus in drawer
    navCloseButton?.focus()

    // Prevent body scroll when drawer is open
    document.body.style.overflow = "hidden"
  }

  const closeDrawer = (): void => {
    isOpen = false
    navDrawer.classList.remove("open")
    navDrawer.setAttribute("aria-hidden", "true")
    backdrop?.classList.remove("visible")

    // Update button states
    desktopMenuButton?.setAttribute("aria-expanded", "false")
    mobileMenuButton?.setAttribute("aria-expanded", "false")

    // Restore body scroll
    document.body.style.overflow = ""

    // Return focus to the trigger button
    const visibleButton = window.innerWidth >= 768 ? desktopMenuButton : mobileMenuButton
    visibleButton?.focus()
  }

  const toggleDrawer = (): void => {
    if (isOpen) {
      closeDrawer()
    } else {
      openDrawer()
    }
  }

  // Menu button click handlers
  desktopMenuButton?.addEventListener("click", e => {
    e.preventDefault()
    e.stopPropagation()
    toggleDrawer()
  })

  mobileMenuButton?.addEventListener("click", e => {
    e.preventDefault()
    e.stopPropagation()
    toggleDrawer()
  })

  // Close button handler
  navCloseButton?.addEventListener("click", e => {
    e.preventDefault()
    closeDrawer()
  })

  // Backdrop click handler (close on click outside)
  backdrop?.addEventListener("click", () => {
    closeDrawer()
  })

  // Close drawer when clicking on a nav link
  navDrawer.querySelectorAll(".mit-learn-nav-item").forEach(link => {
    link.addEventListener("click", () => {
      closeDrawer()
    })
  })

  // Handle Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && isOpen) {
      closeDrawer()
    }
  })

  // Handle click outside drawer (but not on menu buttons)
  document.addEventListener("click", e => {
    if (!isOpen) return

    const target = e.target as Node
    const isClickInsideDrawer = navDrawer.contains(target)
    const isClickOnDesktopButton = desktopMenuButton?.contains(target)
    const isClickOnMobileButton = mobileMenuButton?.contains(target)

    if (!isClickInsideDrawer && !isClickOnDesktopButton && !isClickOnMobileButton) {
      closeDrawer()
    }
  })

  // Add body class to adjust page layout
  document.body.classList.add("has-mit-learn-header")
}

export default initMITLearnHeader
