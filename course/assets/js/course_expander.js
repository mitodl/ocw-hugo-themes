const toggleExpand = (button, container) => {
  const expanded = button.classList.contains("expanded")
  const text = button.querySelector(".text")
  const arrow = button.querySelector(".material-icons")
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

  if (text) {
    text.innerText = expanded ? "Read More" : "Show Less"
  }
}

const initCourseInfoExpander = () => {
  for (const container of document.querySelectorAll(".course-info")) {
    const expanderButton = container.querySelector(".expand-link")
    if (expanderButton) {
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

  for (const container of document.querySelectorAll(".course-description")) {
    const expanderButton = container.querySelector(".expand-link")
    if (expanderButton) {
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
}

export { initCourseInfoExpander }
