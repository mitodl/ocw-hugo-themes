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

  // Ensure initial state matches the HTML (menu open by default)
  toggleButton.setAttribute("aria-expanded", "true")
  menuItems.style.display = "flex"

  // Add event listeners for submenu toggle buttons
  const submenuToggleButtons = document.querySelectorAll<HTMLButtonElement>(
    ".mobile-course-menu-link-with-submenu"
  )

  submenuToggleButtons.forEach(button => {
    button.addEventListener("click", e => {
      e.preventDefault()
      const submenuId = button.getAttribute("aria-controls")
      const submenu = document.getElementById(submenuId!)

      if (!submenu) {
        return
      }

      const isExpanded = button.getAttribute("aria-expanded") === "true"

      if (isExpanded) {
        button.setAttribute("aria-expanded", "false")
        submenu.style.display = "none"
      } else {
        button.setAttribute("aria-expanded", "true")
        submenu.style.display = "flex"
      }
    })
  })

  // Toggle menu visibility
  toggleButton.addEventListener("click", e => {
    e.preventDefault()
    const isExpanded = toggleButton.getAttribute("aria-expanded") === "true"

    if (isExpanded) {
      // Collapse menu
      toggleButton.setAttribute("aria-expanded", "false")
      menuItems.style.display = "none"
    } else {
      // Expand menu
      toggleButton.setAttribute("aria-expanded", "true")
      menuItems.style.display = "flex"
    }
  })

  // Mark current page as active
  const currentPath = window.location.pathname
  const menuLinks = menuItems.querySelectorAll<HTMLAnchorElement>(
    ".mobile-course-menu-link"
  )

  menuLinks.forEach(link => {
    if (link.tagName === "A") {
      const linkPath = new URL(link.href, window.location.origin).pathname
      if (linkPath === currentPath) {
        link.classList.add("active")

        // Expand parent submenu if this is a nested item
        let parent = link.closest(".mobile-course-submenu") as HTMLElement
        while (parent) {
          parent.style.display = "flex"
          const parentButton = document.querySelector(
            `[aria-controls="${parent.id}"]`
          ) as HTMLButtonElement
          if (parentButton) {
            parentButton.setAttribute("aria-expanded", "true")
          }
          // Check for nested parent submenus
          parent = parent.parentElement?.closest(
            ".mobile-course-submenu"
          ) as HTMLElement
        }
      }
    }
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
      toggleButton.setAttribute("aria-expanded", "false")
      menuItems.style.display = "none"
    }
  })
}
