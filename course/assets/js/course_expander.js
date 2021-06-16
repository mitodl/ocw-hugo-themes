const toggleExpand = (button, container) => {
  const expanded = button.classList.contains("expanded")
  const readmoreText = button.querySelector(".read-more-text")
  const arrow = button.querySelector(".expander-arrow")
  if (expanded) {
    button.classList.remove("expanded")
    button.setAttribute("aria-expanded", "false")
    container.classList.add("collapsed")
    if (arrow) {
      arrow.textContent = "keyboard_arrow_right"
    }
  } else {
    button.classList.add("expanded")
    button.setAttribute("aria-expanded", "true")
    container.classList.remove("collapsed")
    if (arrow) {
      arrow.textContent = "keyboard_arrow_down"
    }
  }

  if (readmoreText) {
    readmoreText.textContent = expanded ? "Read More" : "Show Less"
  }
}

const initCourseInfoExpander = document => {
  for (const expanderButton of document.querySelectorAll(".expand-link")) {
    const container = expanderButton.closest(".expand-container")
    expanderButton.addEventListener("click", event => {
      event.preventDefault()
      toggleExpand(expanderButton, container)
    })
    expanderButton.addEventListener("keypress", event => {
      if (event.key === "Enter") {
        event.preventDefault()
        toggleExpand(expanderButton, container)
      }
    })
  }
}

export { initCourseInfoExpander }
