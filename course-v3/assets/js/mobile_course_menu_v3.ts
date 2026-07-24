/**
 * Initialize the mobile course menu v3 toggle functionality
 */
export const initMobileCourseMenuV3 = () => {
  const toggleButton = document.getElementById(
    "mobile-course-menu-toggle-v3"
  ) as HTMLButtonElement
  const menuItems = document.getElementById("mobile-course-menu-items")

  if (!toggleButton || !menuItems) {
    return
  }

  const menuBar = toggleButton.closest(".mobile-course-menu-bar")

  // Keep aria-expanded and .mobile-course-menu-collapsed in sync everywhere
  // the menu's open/closed state changes. The class is a JS fallback for CSS
  // :has(), which is not supported in Firefox < 121 (see
  // mobile-course-menu-v3.scss for the paired CSS rule).
  const setMenuExpanded = (expanded: boolean) => {
    toggleButton.setAttribute("aria-expanded", expanded ? "true" : "false")
    menuBar?.classList.toggle("mobile-course-menu-collapsed", !expanded)
  }

  const closeMenu = () => {
    setMenuExpanded(false)
  }

  // Always start with a collapsed menu on page load/redirect.
  closeMenu()
  window.addEventListener("pageshow", closeMenu)

  // Toggle menu visibility via aria-expanded (CSS handles display)
  toggleButton.addEventListener("click", e => {
    e.preventDefault()
    const isExpanded = toggleButton.getAttribute("aria-expanded") === "true"

    // Toggle aria-expanded attribute (CSS will handle visibility)
    setMenuExpanded(!isExpanded)
  })

  // Close menu when clicking outside
  document.addEventListener("click", e => {
    const target = e.target as Node
    const isExpanded = toggleButton.getAttribute("aria-expanded") === "true"

    // If menu is open and click is outside both the menu and toggle button
    if (
      isExpanded &&
      !menuItems.contains(target) &&
      !toggleButton.contains(target)
    ) {
      closeMenu()
    }
  })

  // Collapse the menu as soon as a navigation link is clicked.
  menuItems.addEventListener("click", e => {
    const target = e.target
    if (target instanceof Element && target.closest("a")) {
      closeMenu()
    }
  })
}
