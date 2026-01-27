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
