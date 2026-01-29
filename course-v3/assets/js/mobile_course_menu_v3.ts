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

  // Toggle menu visibility via aria-expanded (CSS handles display)
  toggleButton.addEventListener("click", e => {
    e.preventDefault()
    const isExpanded = toggleButton.getAttribute("aria-expanded") === "true"

    // Toggle aria-expanded attribute (CSS will handle visibility)
    toggleButton.setAttribute("aria-expanded", isExpanded ? "false" : "true")
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
    }
  })
}
